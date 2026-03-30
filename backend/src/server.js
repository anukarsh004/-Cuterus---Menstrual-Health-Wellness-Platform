import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { OpenAI } from 'openai';

// Load environment
dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate limiter
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests',
  skip: (req) => req.path === '/health'
});

app.use('/api/', rateLimiter);

// Database mock (until Prisma is setup)
const users = new Map();

// Health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: '✅ RUNNING',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'Cuterus Backend is alive!'
  });
});

// Auth endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    if (users.has(email)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const userId = `user_${Date.now()}`;

    users.set(email, {
      id: userId,
      email,
      password: hashedPassword,
      firstName: firstName || '',
      lastName: lastName || '',
      roles: ['USER'],
      createdAt: new Date()
    });

    const accessToken = jwt.sign(
      { userId, email, role: 'USER' },
      process.env.JWT_SECRET || 'dev-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully ✅',
      user: { id: userId, email, firstName },
      accessToken
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = users.get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcryptjs.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.roles[0] },
      process.env.JWT_SECRET || 'dev-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful ✅',
      user: { id: user.id, email: user.email, firstName: user.firstName },
      accessToken
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected route example
app.get('/api/users/profile', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key');
    const user = users.get(decoded.email);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile retrieved ✅',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles
      }
    });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// AI Chat endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    // Token is optional - allow guest access for chatbot
    const token = req.headers.authorization?.split(' ')[1];
    
    const { messages, phaseInfo, user } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Get PHASES from cycleUtils (for backend use)
    const PHASES = {
      MENSTRUATION: { name: 'Menstruation', emoji: '🔴' },
      FOLLICULAR: { name: 'Follicular', emoji: '🌱' },
      OVULATION: { name: 'Ovulation', emoji: '🌕' },
      LUTEAL: { name: 'Luteal', emoji: '🌙' }
    };

    const currentPhase = phaseInfo ? PHASES[phaseInfo.phase] : null;

    const systemPrompt = `You are Utaura 🌸, a warm, empathetic, and knowledgeable menstrual health & wellness companion in the Cuterus app. You are NOT a doctor — always recommend consulting a healthcare provider for serious concerns.

Your personality: Warm, supportive, encouraging, uses emojis naturally (🌸💕✨🌷), never clinical or cold. You call the user by their first name sometimes. Use **bold** for emphasis.

User context:
- Name: ${user?.name || 'User'}
- Cycle length: ${user?.cycleLength || 28} days
- Current cycle day: ${phaseInfo?.totalDay || 'unknown'}
- Current phase: ${currentPhase?.name || 'unknown'} (${currentPhase?.emoji || ''})
- Phase mood: ${currentPhase?.mood || 'unknown'}
- Role: ${user?.role || 'personal'}

Your expertise covers: menstrual cycle phases, symptom management (cramps, bloating, headaches, mood, fatigue, nausea, back pain, breast tenderness), nutrition by phase, exercise by phase, sleep tips, skincare, PMS/PMDD, PCOS, endometriosis, fertility, contraception, menopause, mental health, self-care, relationships, hygiene, when to see a doctor, and work productivity by cycle phase.

Always provide phase-specific advice when relevant. Be thorough but conversational. End responses with encouragement.`;

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
    ];

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-your-openai-key-here') {
      return res.status(500).json({
        error: 'OpenAI API key not configured. Add your key to backend/.env.local',
      });
    }

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
      details: error.message
    });
  }
});

// Chat rooms endpoint (mock)
app.get('/api/chat/rooms', (req, res) => {
  res.json({
    message: 'Chat rooms retrieved ✅',
    data: [
      { id: 'room_1', name: 'General', participants: 3 },
      { id: 'room_2', name: 'AI Chat', participants: 5 }
    ]
  });
});

// Calendar events endpoint (mock)
app.get('/api/calendar/events', (req, res) => {
  res.json({
    message: 'Calendar events retrieved ✅',
    data: [
      { id: 'event_1', title: 'Meeting', start: new Date(), end: new Date() }
    ]
  });
});

// Analytics endpoint (mock)
app.get('/api/analytics/summary', (req, res) => {
  res.json({
    message: 'Analytics summary ✅',
    data: {
      totalUsers: 5,
      activeChats: 12,
      aiInteractions: 45,
      calendarEvents: 8
    }
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method,
    availableEndpoints: [
      'GET /health',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/users/profile',
      'POST /api/ai/chat',
      'GET /api/chat/rooms',
      'GET /api/calendar/events',
      'GET /api/analytics/summary'
    ]
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  ✅ CUTERUS BACKEND LIVE & RUNNING ✅  ║
╠════════════════════════════════════════╣
║                                        ║
║  🚀 API Base:  http://localhost:${PORT}   ║
║  📊 Health:    /health                ║
║  🔐 Auth:      /api/auth/*            ║
║  💬 Chat:      /api/chat/*            ║
║  🤖 AI:        /api/ai/*              ║
║  📅 Calendar:  /api/calendar/*        ║
║  📈 Analytics: /api/analytics/*       ║
║                                        ║
║  Test the server:                     ║
║  curl http://localhost:${PORT}/health      ║
║                                        ║
╚════════════════════════════════════════╝
  `);

  console.log('\n📝 Example requests:\n');
  console.log('Register: POST /api/auth/register');
  console.log('  { "email": "test@example.com", "password": "test123" }\n');
  console.log('Login: POST /api/auth/login');
  console.log('  { "email": "test@example.com", "password": "test123" }\n');
});

export default app;
