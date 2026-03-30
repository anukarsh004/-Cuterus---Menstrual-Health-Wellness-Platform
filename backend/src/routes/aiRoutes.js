import express from 'express';
import { OpenAI } from 'openai';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { PHASES, getDaysUntilNextPeriod } from '../../src/utils/cycleUtils.js';

const router = express.Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST /api/ai/chat - Send message to AI chatbot
router.post('/chat', authMiddleware, async (req, res) => {
  try {
    const { messages, phaseInfo, user } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const currentPhase = phaseInfo ? PHASES[phaseInfo.phase] : null;
    const daysUntil = getDaysUntilNextPeriod(user?.lastPeriodStart, user?.cycleLength);

    const systemPrompt = `You are Utaura 🌸, a warm, empathetic, and knowledgeable menstrual health & wellness companion in the Cuterus app. You are NOT a doctor — always recommend consulting a healthcare provider for serious concerns.

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

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
    ];

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: apiMessages,
      max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '800'),
      temperature: 0.8,
    });

    const assistantMessage = response.choices[0].message.content;

    res.json({
      success: true,
      message: assistantMessage,
      usage: {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
      },
    });
  } catch (error) {
    console.error('OpenAI API error:', error);

    // Handle specific OpenAI errors
    if (error.status === 401) {
      return res.status(401).json({
        error: 'Invalid OpenAI API key. Check your configuration.',
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded or no credits. Check your OpenAI billing at platform.openai.com',
      });
    }

    if (error.status === 400) {
      return res.status(400).json({
        error: error.message || 'Invalid request to OpenAI API',
      });
    }

    res.status(500).json({
      error: 'Failed to generate AI response. Try again later.',
    });
  }
});

export default router;
