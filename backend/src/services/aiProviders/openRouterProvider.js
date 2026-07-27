/**
 * OpenRouter AI Provider
 * Primary AI provider for the chatbot
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Cycle utilities (mirrored from frontend)
const PHASES = {
  MENSTRUATION: { name: 'Menstruation', emoji: '🔴', mood: 'Rest & Recharge' },
  FOLLICULAR: { name: 'Follicular', emoji: '🌱', mood: 'Growth & Energy' },
  OVULATION: { name: 'Ovulation', emoji: '🌕', mood: 'Peak Performance' },
  LUTEAL: { name: 'Luteal', emoji: '🌙', mood: 'Prepare & Reflect' },
};

function predictNextPeriod(lastPeriodStart, cycleLength = 28) {
  if (!lastPeriodStart) return null;
  const start = new Date(lastPeriodStart);
  const today = new Date();
  const daysDiff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  const cyclesElapsed = Math.floor(daysDiff / cycleLength);
  const nextStart = new Date(start);
  nextStart.setDate(nextStart.getDate() + (cyclesElapsed + 1) * cycleLength);
  return nextStart;
}

function getDaysUntilNextPeriod(lastPeriodStart, cycleLength = 28) {
  const nextPeriod = predictNextPeriod(lastPeriodStart, cycleLength);
  if (!nextPeriod) return null;
  const today = new Date();
  return Math.ceil((nextPeriod - today) / (1000 * 60 * 60 * 24));
}

/**
 * Build the system prompt for the AI
 */
function buildSystemPrompt(phaseInfo, user) {
  const currentPhase = phaseInfo ? PHASES[phaseInfo.phase] : null;
  const daysUntil = getDaysUntilNextPeriod(user?.lastPeriodStart, user?.cycleLength);

  return `You are Utaura 🌸, a warm, empathetic, and knowledgeable menstrual health & wellness companion in the Cuterus app. You are NOT a doctor — always recommend consulting a healthcare provider for serious concerns.

Your personality: Warm, supportive, encouraging, uses emojis naturally (🌸💕✨🌷), never clinical or cold. You call the user by their first name sometimes. Use **bold** for emphasis.

User context:
- Name: ${user?.name || 'User'}
- Cycle length: ${user?.cycleLength || 28} days
- Current cycle day: ${phaseInfo?.totalDay || 'unknown'}
- Current phase: ${currentPhase?.name || 'unknown'} (${currentPhase?.emoji || ''})
- Phase mood: ${currentPhase?.mood || 'unknown'}
- Days until next period: ${daysUntil || 'unknown'}
- Role: ${user?.role || 'personal'}

Your expertise covers: menstrual cycle phases, symptom management (cramps, bloating, headaches, mood, fatigue, nausea, back pain, breast tenderness), nutrition by phase, exercise by phase, sleep tips, skincare, PMS/PMDD, PCOS, endometriosis, fertility, contraception, menopause, mental health, self-care, relationships, hygiene, when to see a doctor, and work productivity by cycle phase.

Always provide phase-specific advice when relevant. Be thorough but conversational. End responses with encouragement.`;
}

/**
 * Call OpenRouter API
 * @param {Array} messages - Chat messages
 * @param {Object} phaseInfo - User's cycle phase info
 * @param {Object} user - User data
 * @param {Object} options - { timeout, attempt, maxRetries }
 * @returns {Object} { message, usage }
 */
export async function callOpenRouter(messages, phaseInfo, user, options = {}) {
  const timeout = options.timeout || 30000;
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

  // Check if API key is configured
  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'sk-or-v1-your-key-here') {
    const error = new Error('OpenRouter API key not configured');
    error.statusCode = 401;
    throw error;
  }

  const systemPrompt = buildSystemPrompt(phaseInfo, user);
  const model = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';
  const maxTokens = parseInt(process.env.OPENROUTER_MAX_TOKENS || '1500');

  // Build messages array (OpenAI-compatible format)
  const recentMessages = messages.slice(-10).filter(m => m.role !== 'system');
  const openRouterMessages = [
    { role: 'system', content: systemPrompt },
    ...recentMessages.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    })),
  ];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    console.log(`[OpenRouter] Calling model: ${model} (timeout: ${timeout}ms)`);

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5500',
        'X-Title': 'Cuterus - Menstrual Health & Wellness',
      },
      body: JSON.stringify({
        model,
        messages: openRouterMessages,
        max_tokens: maxTokens,
        temperature: 0.8,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      console.error(`[OpenRouter] HTTP ${response.status}:`, errorBody.substring(0, 200));

      const error = new Error(`OpenRouter returned ${response.status}`);
      error.statusCode = response.status;
      error.status = response.status;
      error.retryAfter = response.headers.get('retry-after') 
        ? parseInt(response.headers.get('retry-after')) 
        : undefined;
      error.body = errorBody;
      throw error;
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content;
    
    if (!assistantMessage) {
      throw new Error('OpenRouter returned empty response');
    }

    const usage = data.usage || {};

    console.log(`[OpenRouter] ✅ Success (${usage.total_tokens || 0} tokens)`);

    return {
      message: assistantMessage,
      usage: {
        promptTokens: usage.prompt_tokens || 0,
        completionTokens: usage.completion_tokens || 0,
        totalTokens: usage.total_tokens || 0,
      },
    };
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle abort/timeout
    if (error.name === 'AbortError') {
      const timeoutError = new Error('OpenRouter request timed out');
      timeoutError.name = 'AbortError';
      timeoutError.statusCode = 504;
      throw timeoutError;
    }

    // Re-throw if it already has statusCode (from our error handling above)
    if (error.statusCode) {
      throw error;
    }

    // Network errors
    if (error.message?.includes('Failed to fetch') || error.message?.includes('fetch failed') || error.code === 'ECONNREFUSED') {
      const netError = new Error('Failed to connect to OpenRouter');
      netError.statusCode = 503;
      netError.code = 'ECONNREFUSED';
      throw netError;
    }

    // Unknown errors
    const unknownError = new Error(error.message || 'Unknown OpenRouter error');
    unknownError.statusCode = 500;
    throw unknownError;
  }
}

