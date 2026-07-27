/**
 * AI Provider Abstraction Layer
 * 
 * Manages multiple AI providers with automatic fallback.
 * Provider order is configurable via environment variable AI_PROVIDER_ORDER.
 * 
 * Features:
 * - Primary/secondary provider fallback
 * - Exponential backoff retry (1s, 2s, 4s, up to 3 attempts)
 * - Structured error types
 * - Response time monitoring
 */

import { callOpenRouter } from './aiProviders/openRouterProvider.js';
import { callGemini } from './aiProviders/geminiProvider.js';
import { AppError, ErrorTypes } from '../middleware/errorHandler.js';

// Provider registry
const PROVIDERS = {
  openrouter: { name: 'OpenRouter', handler: callOpenRouter },
  gemini: { name: 'Gemini', handler: callGemini },
};

// Default provider order (can be overridden by env var)
const DEFAULT_PROVIDER_ORDER = ['openrouter', 'gemini'];

/**
 * Parse provider order from environment variable
 * Format: comma-separated list, e.g., "openrouter,gemini"
 */
function getProviderOrder() {
  const envOrder = process.env.AI_PROVIDER_ORDER;
  if (envOrder) {
    const order = envOrder.split(',').map(s => s.trim().toLowerCase()).filter(s => s);
    const valid = order.filter(p => PROVIDERS[p]);
    if (valid.length > 0) return valid;
  }
  return DEFAULT_PROVIDER_ORDER;
}

/**
 * Calculate delay for exponential backoff
 * @param {number} attempt - Current attempt number (0-based)
 * @returns {number} Delay in milliseconds
 */
function getBackoffDelay(attempt) {
  const baseDelay = 1000; // 1 second
  const maxDelay = 4000;  // 4 seconds
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  // Add jitter (±20%) to prevent thundering herd
  const jitter = delay * 0.2 * (Math.random() * 2 - 1);
  return Math.round(delay + jitter);
}

/**
 * Check if an error is retryable
 */
function isRetryableError(error) {
  // Network errors are retryable
  if (error.message?.includes('Failed to fetch') || 
      error.message?.includes('fetch failed') ||
      error.code === 'ECONNREFUSED' ||
      error.code === 'ECONNRESET' ||
      error.code === 'ETIMEDOUT') {
    return true;
  }
  
  // Rate limits are retryable
  if (error.statusCode === 429 || error.status === 429) {
    return true;
  }
  
  // Server errors (5xx) are retryable
  if (error.statusCode >= 500 || error.status >= 500) {
    return true;
  }
  
  // Timeouts are retryable
  if (error.name === 'AbortError' || error.errorType === ErrorTypes.TIMEOUT) {
    return true;
  }
  
  // Provider unavailable is retryable (will try next provider)
  if (error.errorType === ErrorTypes.PROVIDER_UNAVAILABLE) {
    return true;
  }
  
  return false;
}

/**
 * Classify an error into a specific error type
 */
function classifyError(error, providerName) {
  // Network errors
  if (error.message?.includes('Failed to fetch') || 
      error.message?.includes('fetch failed') ||
      error.code === 'ECONNREFUSED' ||
      error.code === 'ECONNRESET') {
    return new AppError(
      `${providerName} is unreachable. Please check your internet connection.`,
      503,
      ErrorTypes.NETWORK_FAILURE,
      { provider: providerName, originalError: error.message }
    );
  }
  
  // Timeouts
  if (error.name === 'AbortError' || error.message?.includes('timeout') || error.message?.includes('timed out')) {
    return new AppError(
      `${providerName} request timed out. Please try again.`,
      504,
      ErrorTypes.TIMEOUT,
      { provider: providerName, originalError: error.message }
    );
  }
  
  // Rate limits
  if (error.statusCode === 429 || error.status === 429) {
    return new AppError(
      `${providerName} is temporarily busy. Please try again in a minute.`,
      429,
      ErrorTypes.RATE_LIMIT,
      { provider: providerName, retryAfter: error.retryAfter || 60 }
    );
  }
  
  // Invalid API key
  if (error.statusCode === 401 || error.status === 401 || 
     (error.statusCode === 400 && error.body?.includes('API key not valid'))) {
    return new AppError(
      `Invalid API key for ${providerName}. Please check your configuration.`,
      401,
      ErrorTypes.INVALID_API_KEY,
      { provider: providerName }
    );
  }
  
  // Auth failure
  if (error.statusCode === 403 || error.status === 403) {
    return new AppError(
      `Authentication failed for ${providerName}. Please check your credentials.`,
      403,
      ErrorTypes.AUTH_FAILURE,
      { provider: providerName }
    );
  }
  
  // Provider unavailable (e.g., insufficient credits)
  if (error.statusCode === 402 || error.status === 402) {
    return new AppError(
      `${providerName} has insufficient credits. Please add credits to continue.`,
      402,
      ErrorTypes.PROVIDER_UNAVAILABLE,
      { provider: providerName }
    );
  }
  
  // Internal server error from provider
  if (error.statusCode >= 500 || error.status >= 500) {
    return new AppError(
      `${providerName} encountered an internal error. Please try again later.`,
      502,
      ErrorTypes.INTERNAL_SERVER_ERROR,
      { provider: providerName, originalError: error.message }
    );
  }
  
  // Default
  return new AppError(
    error.message || `Unknown error from ${providerName}`,
    error.statusCode || 500,
    ErrorTypes.INTERNAL_SERVER_ERROR,
    { provider: providerName }
  );
}

/**
 * Send a message to the AI with automatic fallback and retry
 * 
 * @param {Array} messages - Chat messages
 * @param {Object} phaseInfo - User's cycle phase info
 * @param {Object} user - User data
 * @param {Object} options - Options (providerOrder, maxRetries, timeout)
 * @param {Object} req - Express request object (for logging)
 * @returns {Object} { message, provider, usage, retryAttempts }
 */
export async function sendToAI(messages, phaseInfo, user, options = {}, req = null) {
  const providerOrder = options.providerOrder || getProviderOrder();
  const maxRetries = options.maxRetries || 3;
  const timeout = options.timeout || 30000;
  
  let lastError = null;
  let totalRetries = 0;
  
  // Try each provider in order
  for (let providerIndex = 0; providerIndex < providerOrder.length; providerIndex++) {
    const providerName = providerOrder[providerIndex];
    const provider = PROVIDERS[providerName];
    
    if (!provider) {
      console.warn(`[AI Provider] Unknown provider: ${providerName}, skipping`);
      continue;
    }
    
    console.log(`[AI Provider] Attempting provider: ${provider.name} (${providerIndex + 1}/${providerOrder.length})`);
    
    // Try with retries for this provider
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const isLastAttempt = attempt === maxRetries;
      const isLastProvider = providerIndex === providerOrder.length - 1;
      
      try {
        if (req) {
          req.aiProvider = provider.name;
          req.retryAttempts = totalRetries;
        }
        
        const result = await provider.handler(messages, phaseInfo, user, {
          timeout,
          attempt,
          maxRetries,
        });
        
        // Success!
        console.log(`[AI Provider] ✅ ${provider.name} responded successfully (attempt ${attempt + 1})`);
        
        return {
          message: result.message,
          provider: provider.name,
          usage: result.usage || {},
          retryAttempts: totalRetries,
        };
      } catch (error) {
        totalRetries++;
        lastError = error;
        
        const classified = classifyError(error, provider.name);
        
        console.warn(`[AI Provider] ❌ ${provider.name} failed (attempt ${attempt + 1}/${maxRetries + 1}): ${classified.errorType} - ${classified.message}`);
        
        // If this is a non-retryable error and we have more providers, try next provider
        if (!isRetryableError(error) && !isLastProvider) {
          console.log(`[AI Provider] → Switching to next provider (non-retryable error)`);
          break; // Break out of retry loop, try next provider
        }
        
        // If this is a non-retryable error and this is the last provider, throw
        if (!isRetryableError(error) && isLastProvider) {
          throw classified;
        }
        
        // If retryable and not last attempt, wait and retry
        if (isRetryableError(error) && !isLastAttempt) {
          const delay = getBackoffDelay(attempt);
          console.log(`[AI Provider] → Retrying ${provider.name} in ${delay}ms (attempt ${attempt + 2}/${maxRetries + 1})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // If retryable, last attempt, and we have more providers, try next provider
        if (isRetryableError(error) && isLastAttempt && !isLastProvider) {
          console.log(`[AI Provider] → Switching to next provider after exhausting retries`);
          break;
        }
        
        // If retryable, last attempt, and last provider, throw
        if (isRetryableError(error) && isLastAttempt && isLastProvider) {
          throw classified;
        }
      }
    }
  }
  
  // If we exhausted all providers, throw the last error
  throw lastError || new AppError(
    'All AI providers are currently unavailable. Please try again later.',
    503,
    ErrorTypes.PROVIDER_UNAVAILABLE
  );
}

/**
 * Check which providers are available
 */
export async function checkProviderAvailability() {
  const order = getProviderOrder();
  const available = [];
  
  for (const name of order) {
    const provider = PROVIDERS[name];
    if (!provider) continue;
    
    const key = name === 'openrouter' 
      ? process.env.OPENROUTER_API_KEY 
      : process.env.GEMINI_API_KEY;
    
    if (key && key !== 'sk-or-v1-your-key-here' && key !== 'your-gemini-api-key-here') {
      available.push(name);
    }
  }
  
  return available;
}

