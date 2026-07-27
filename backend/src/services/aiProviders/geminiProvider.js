/**
 * Google Gemini AI Provider
 * Secondary/fallback AI provider for the chatbot
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

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
 * Build the system prompt for Gemini
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
 * Call Google Gemini API
 * @param {Array} messages - Chat messages
 * @param {Object} phaseInfo - User's cycle phase info
 * @param {Object} user - User data
 * @param {Object} options - { timeout, attempt, maxRetries }
 * @returns {Object} { message, usage }
 */
export async function callGemini(messages, phaseInfo, user, options = {}) {
  const timeout = options.timeout || 30000;
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  // Check if API key is configured
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your-gemini-api-key-here') {
    const error = new Error('Gemini API key not configured');
    error.statusCode = 401;
    throw error;
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const systemPrompt = buildSystemPrompt(phaseInfo, user);

  // Build conversation history for Gemini format
  const recentMessages = messages.slice(-10).filter(m => m.role !== 'system');
  
  // Gemini uses a different format - we need to convert
  const contents = [];
  
  // Add system prompt as first user message context
  let conversationHistory = `[System: ${systemPrompt}]\n\n`;
  
  for (const msg of recentMessages) {
    const role = msg.role === 'assistant' ? 'model' : 'user';
    conversationHistory += `${role === 'model' ? 'Assistant' : 'User'}: ${msg.content}\n\n`;
  }

  // Gemini API expects contents array with role and parts
  contents.push({
    role: 'user',
    parts: [{ text: conversationHistory + 'Assistant: ' }],
  });

  const apiUrl = `${GEMINI_API_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    console.log(`[Gemini] Calling model: ${model} (timeout: ${timeout}ms)`);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: parseInt(process.env.OPENROUTER_MAX_TOKENS || '1500'),
          topP: 0.95,
          topK: 40,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      console.error(`[Gemini] HTTP ${response.status}:`, errorBody.substring(0, 200));

      const error = new Error(`Gemini returned ${response.status}`);
      error.statusCode = response.status;
      error.status = response.status;
      error.body = errorBody;
      throw error;
    }

    const data = await response.json();
    
    // Extract text from Gemini response
    const assistantMessage = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!assistantMessage) {
      // Check if blocked
      const blockReason = data.promptFeedback?.blockReason;
      if (blockReason) {
        throw new Error(`Gemini blocked the request: ${blockReason}`);
      }
      throw new Error('Gemini returned empty response');
    }

    // Clean up the response - remove "Assistant: " prefix if present
    const cleanedMessage = assistantMessage.replace(/^Assistant:\s*/i, '').trim();

    // Calculate approximate token usage (Gemini doesn't return token counts easily)
    const promptTokens = Math.ceil(conversationHistory.length / 4);
    const completionTokens = Math.ceil(cleanedMessage.length / 4);

    console.log(`[Gemini] ✅ Success`);

    return {
      message: cleanedMessage,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
      },
    };
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle abort/timeout
    if (error.name === 'AbortError') {
      const timeoutError = new Error('Gemini request timed out');
      timeoutError.name = 'AbortError';
      timeoutError.statusCode = 504;
      throw timeoutError;
    }

    // Re-throw if it already has statusCode
    if (error.statusCode) {
      throw error;
    }

    // Network errors
    if (error.message?.includes('Failed to fetch') || error.message?.includes('fetch failed') || error.code === 'ECONNREFUSED') {
      const netError = new Error('Failed to connect to Gemini');
      netError.statusCode = 503;
      netError.code = 'ECONNREFUSED';
      throw netError;
    }

    // Unknown errors
    const unknownError = new Error(error.message || 'Unknown Gemini error');
    unknownError.statusCode = 500;
    throw unknownError;
  }
}
