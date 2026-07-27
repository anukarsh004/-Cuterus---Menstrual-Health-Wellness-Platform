/**
 * Frontend Chat Service
 * 
 * Features:
 * - Request deduplication (cancels previous pending requests on new send)
 * - Debouncing (300ms between rapid sends)
 * - Response caching (deduplicates identical requests within 5 minutes)
 * - Proper error categorization
 * - Exponential backoff retry
 * - Request timing/monitoring logs
 * - No automatic fallback to "local AI" for HTTP errors
 */

// Cache configuration
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const DEBOUNCE_MS = 300;
const MAX_RETRIES = 3;
const BASE_TIMEOUT_MS = 30000;

// Error types matching backend
export const ErrorTypes = {
  NETWORK_FAILURE: 'NETWORK_FAILURE',
  BACKEND_OFFLINE: 'BACKEND_OFFLINE',
  RATE_LIMIT: 'RATE_LIMIT',
  INVALID_API_KEY: 'INVALID_API_KEY',
  AUTH_FAILURE: 'AUTH_FAILURE',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  TIMEOUT: 'TIMEOUT',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PROVIDER_UNAVAILABLE: 'PROVIDER_UNAVAILABLE',
};

// Human-readable messages for each error type
export const ErrorMessages = {
  [ErrorTypes.NETWORK_FAILURE]: 'Unable to reach the AI service. Please check your internet connection.',
  [ErrorTypes.BACKEND_OFFLINE]: 'The wellness service is temporarily offline. Please try again later.',
  [ErrorTypes.RATE_LIMIT]: 'The AI service is temporarily busy. Please try again in a minute.',
  [ErrorTypes.INVALID_API_KEY]: 'AI service configuration error. Please contact support.',
  [ErrorTypes.AUTH_FAILURE]: 'Authentication failed. Please log in again.',
  [ErrorTypes.INTERNAL_SERVER_ERROR]: 'Something went wrong. Please try again.',
  [ErrorTypes.TIMEOUT]: 'The AI service is taking too long. Please try again.',
  [ErrorTypes.VALIDATION_ERROR]: 'Invalid request. Please try rephrasing your message.',
  [ErrorTypes.PROVIDER_UNAVAILABLE]: 'All AI providers are currently unavailable. Please try again later.',
};

// Cache store
const responseCache = new Map();

// Track pending requests for deduplication
let pendingController = null;
let pendingRequestId = null;

// Debounce timer
let debounceTimer = null;
let lastSendTime = 0;

/**
 * Generate a cache key from messages
 */
function getCacheKey(messages) {
  const lastMsg = messages[messages.length - 1];
  if (!lastMsg) return '';
  return `chat_${lastMsg.content.substring(0, 200)}`;
}

/**
 * Check if a response is in cache and still valid
 */
function getCachedResponse(key) {
  const entry = responseCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    responseCache.delete(key);
    return null;
  }
  return entry.response;
}

/**
 * Store a response in cache
 */
function setCachedResponse(key, response) {
  responseCache.set(key, {
    response,
    timestamp: Date.now(),
  });
  // Clean old entries if cache is too large
  if (responseCache.size > 50) {
    const oldest = [...responseCache.entries()]
      .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0];
    if (oldest) responseCache.delete(oldest[0]);
  }
}

/**
 * Calculate exponential backoff delay
 */
function getBackoffDelay(attempt) {
  const baseDelay = 1000;
  const maxDelay = 4000;
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  const jitter = delay * 0.2 * (Math.random() * 2 - 1);
  return Math.round(delay + jitter);
}

/**
 * Classify an error from a fetch response
 */
function classifyResponseError(response, body) {
  const status = response.status;

  if (status === 429) {
    return {
      type: ErrorTypes.RATE_LIMIT,
      message: ErrorMessages[ErrorTypes.RATE_LIMIT],
      retryAfter: parseInt(response.headers.get('retry-after') || '60'),
    };
  }

  if (status === 401) {
    return {
      type: ErrorTypes.INVALID_API_KEY,
      message: body?.error || ErrorMessages[ErrorTypes.INVALID_API_KEY],
    };
  }

  if (status === 403) {
    return {
      type: ErrorTypes.AUTH_FAILURE,
      message: body?.error || ErrorMessages[ErrorTypes.AUTH_FAILURE],
    };
  }

  if (status === 502 || status === 503) {
    return {
      type: ErrorTypes.BACKEND_OFFLINE,
      message: body?.error || ErrorMessages[ErrorTypes.BACKEND_OFFLINE],
    };
  }

  if (status === 504) {
    return {
      type: ErrorTypes.TIMEOUT,
      message: body?.error || ErrorMessages[ErrorTypes.TIMEOUT],
    };
  }

  if (status >= 500) {
    return {
      type: ErrorTypes.INTERNAL_SERVER_ERROR,
      message: body?.error || ErrorMessages[ErrorTypes.INTERNAL_SERVER_ERROR],
    };
  }

  if (status === 400) {
    return {
      type: ErrorTypes.VALIDATION_ERROR,
      message: body?.error || ErrorMessages[ErrorTypes.VALIDATION_ERROR],
    };
  }

  return {
    type: ErrorTypes.INTERNAL_SERVER_ERROR,
    message: body?.error || `HTTP ${status}: ${ErrorMessages[ErrorTypes.INTERNAL_SERVER_ERROR]}`,
  };
}

/**
 * Classify a network error
 */
function classifyNetworkError(error) {
  if (error.name === 'AbortError') {
    return {
      type: ErrorTypes.TIMEOUT,
      message: ErrorMessages[ErrorTypes.TIMEOUT],
    };
  }

  if (error.message?.includes('Failed to fetch') || 
      error.message?.includes('NetworkError') ||
      error.message?.includes('network') ||
      error.code === 'ECONNREFUSED' ||
      error.code === 'ECONNRESET' ||
      error.code === 'ETIMEDOUT') {
    return {
      type: ErrorTypes.NETWORK_FAILURE,
      message: ErrorMessages[ErrorTypes.NETWORK_FAILURE],
    };
  }

  return {
    type: ErrorTypes.INTERNAL_SERVER_ERROR,
    message: error.message || ErrorMessages[ErrorTypes.INTERNAL_SERVER_ERROR],
  };
}

/**
 * Send a chat message to the backend AI
 * 
 * @param {Array} messages - Chat message history
 * @param {Object} phaseInfo - User cycle phase info
 * @param {Object} user - User data
 * @param {Object} options - { debounce, useCache, signal }
 * @returns {Object} { message, provider, usage, retryAttempts }
 */
export async function sendChatMessage(messages, phaseInfo, user, options = {}) {
  const useDebounce = options.debounce !== false;
  const useCache = options.useCache !== false;

  // Check cache first
  if (useCache) {
    const cacheKey = getCacheKey(messages);
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      console.log('[ChatService] Returning cached response');
      return cached;
    }
  }

  // Debounce: prevent rapid sends
  if (useDebounce) {
    const now = Date.now();
    const timeSinceLastSend = now - lastSendTime;
    if (timeSinceLastSend < DEBOUNCE_MS) {
      console.log(`[ChatService] Debouncing (${timeSinceLastSend}ms since last send)`);
      await new Promise(resolve => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(resolve, DEBOUNCE_MS - timeSinceLastSend);
      });
    }
    lastSendTime = Date.now();
  }

  // Cancel previous pending request
  if (pendingController) {
    console.log('[ChatService] Cancelling previous pending request');
    pendingController.abort();
  }

  // Create new abort controller
  const controller = options.signal ? null : new AbortController();
  const signal = options.signal || (controller ? controller.signal : null);
  pendingController = controller;
  pendingRequestId = `req_${Date.now()}`;

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
  const aiChatUrl = `${apiBaseUrl.replace(/\/+$/, '')}/api/ai/chat`;

  let lastError = null;

  // Retry loop
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const isLastAttempt = attempt === MAX_RETRIES;
    const timeoutMs = BASE_TIMEOUT_MS * (attempt + 1); // Increase timeout with retries

    const requestController = new AbortController();
    const timeoutId = setTimeout(() => requestController.abort(), timeoutMs);

    // Combine with external signal if provided
    const combinedSignal = signal 
      ? combineSignals(signal, requestController.signal)
      : requestController.signal;

    const requestStart = Date.now();

    try {
      const token = localStorage.getItem('auth_token');
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      console.log(`[ChatService] Sending request (attempt ${attempt + 1}/${MAX_RETRIES + 1})`);

      const response = await fetch(aiChatUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages,
          phaseInfo,
          user,
        }),
        signal: combinedSignal,
      });

      clearTimeout(timeoutId);
      const duration = Date.now() - requestStart;

      // Try to parse response body
      let body = null;
      try {
        body = await response.json();
      } catch {
        body = { error: 'Invalid response from server' };
      }

      // Log monitoring data
      logRequest({
        requestId: pendingRequestId,
        duration,
        statusCode: response.status,
        attempt: attempt + 1,
        provider: body?.provider || 'unknown',
        errorType: response.ok ? null : body?.errorType,
        errorMessage: response.ok ? null : (body?.error || null),
      });

      if (!response.ok) {
        const errorInfo = classifyResponseError(response, body);
        lastError = errorInfo;

        // Non-retryable errors
        if (!isRetryableStatus(response.status)) {
          throw new ChatError(errorInfo.message, errorInfo.type, response.status);
        }

        // Last attempt - throw
        if (isLastAttempt) {
          throw new ChatError(errorInfo.message, errorInfo.type, response.status);
        }

        // Wait and retry
        const delay = getBackoffDelay(attempt);
        console.log(`[ChatService] Retrying in ${delay}ms (status: ${response.status})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // Success!
      const result = {
        message: body.message,
        provider: body.provider || 'unknown',
        usage: body.usage || {},
        retryAttempts: attempt,
      };

      // Cache the response
      if (useCache) {
        const cacheKey = getCacheKey(messages);
        setCachedResponse(cacheKey, result);
      }

      console.log(`[ChatService] ✅ Success (${duration}ms, provider: ${result.provider})`);
      return result;

    } catch (error) {
      clearTimeout(timeoutId);
      const duration = Date.now() - requestStart;

      // If it's a ChatError (already classified), re-throw if last attempt
      if (error instanceof ChatError) {
        if (isLastAttempt) {
          logRequest({
            requestId: pendingRequestId,
            duration,
            statusCode: error.statusCode,
            attempt: attempt + 1,
            errorType: error.errorType,
            errorMessage: error.message,
          });
          throw error;
        }
        lastError = {
          type: error.errorType,
          message: error.message,
        };
        const delay = getBackoffDelay(attempt);
        console.log(`[ChatService] Retrying in ${delay}ms (${error.errorType})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // Classify network errors
      const errorInfo = classifyNetworkError(error);
      lastError = errorInfo;

      logRequest({
        requestId: pendingRequestId,
        duration,
        statusCode: 0,
        attempt: attempt + 1,
        errorType: errorInfo.type,
        errorMessage: error.message,
      });

      // Last attempt - throw
      if (isLastAttempt) {
        throw new ChatError(errorInfo.message, errorInfo.type, 0);
      }

      // Retry for network errors
      const delay = getBackoffDelay(attempt);
      console.log(`[ChatService] Retrying in ${delay}ms (${errorInfo.type})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // Should not reach here, but just in case
  throw new ChatError(
    lastError?.message || ErrorMessages[ErrorTypes.PROVIDER_UNAVAILABLE],
    lastError?.type || ErrorTypes.PROVIDER_UNAVAILABLE,
    503
  );
}

/**
 * Check if an HTTP status is retryable
 */
function isRetryableStatus(status) {
  return status === 429 || status === 502 || status === 503 || status === 504 || status >= 500;
}

/**
 * ChatError class
 */
export class ChatError extends Error {
  constructor(message, errorType, statusCode) {
    super(message);
    this.name = 'ChatError';
    this.errorType = errorType;
    this.statusCode = statusCode;
  }
}

/**
 * Log a request for monitoring
 */
function logRequest(data) {
  if (import.meta.env.DEV) {
    const icon = data.statusCode >= 200 && data.statusCode < 400 ? '✅' : '❌';
    console.log(
      `[ChatMonitor] ${icon} ${data.requestId} ${data.duration}ms ` +
      `status=${data.statusCode} attempt=${data.attempt} ` +
      `provider=${data.provider || 'unknown'} ` +
      `error=${data.errorType || 'none'}`
    );
  }

  // Store in window for potential debugging
  if (!window.__chatLogs) window.__chatLogs = [];
  window.__chatLogs.push({
    ...data,
    timestamp: new Date().toISOString(),
  });
  if (window.__chatLogs.length > 200) window.__chatLogs.shift();
}

/**
 * Combine multiple AbortSignals into one
 */
function combineSignals(...signals) {
  const controller = new AbortController();
  
for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      return controller.signal;
    }
    signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true });
  }

  return controller.signal;
}

export function getChatLogs() {
  return window.__chatLogs || [];
}
