/**
 * CUTERUS BACKEND - MAIN SERVER
 * src/server.js
 * 
 * Express API with WebSocket support
 * Requires: Node.js 18+
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Validate required env vars
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'REDIS_URL',
  'OPENAI_API_KEY'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const httpServer = createServer(app);

// Socket.io Setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Trust proxy
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Static Files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health Check (before DB connection)
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Initialize Database and Redis
let prisma, redis;

async function initializeConnections() {
  try {
    // Prisma
    const { PrismaClient } = await import('@prisma/client');
    prisma = new PrismaClient();
    await prisma.$connect();
    console.log('✅ PostgreSQL connected');

    // Redis
    const Redis = (await import('ioredis')).default;
    redis = new Redis(process.env.REDIS_URL, {
      retryStrategy: (times) => Math.min(times * 50, 2000),
      maxRetriesPerRequest: null
    });

    redis.on('connect', () => console.log('✅ Redis connected'));
    redis.on('error', (err) => console.error('❌ Redis error:', err));

    // Attach to app
    app.locals.prisma = prisma;
    app.locals.redis = redis;

    return true;
  } catch (error) {
    console.error('❌ Connection initialization failed:', error);
    process.exit(1);
  }
}

// Middleware
import { rateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

app.use(requestLogger);
app.use('/api/', rateLimiter);

// Routes
import { setupAuthRoutes } from './routes/authRoutes.js';
import { setupUserRoutes } from './routes/userRoutes.js';
import { setupChatRoutes } from './routes/chatRoutes.js';
import { setupAIRoutes } from './routes/aiRoutes.js';
import { setupCalendarRoutes } from './routes/calendarRoutes.js';
import { setupAnalyticsRoutes } from './routes/analyticsRoutes.js';

app.use('/api/auth', setupAuthRoutes(app));
app.use('/api/users', setupUserRoutes(app));
app.use('/api/chat', setupChatRoutes(app));
app.use('/api/ai', setupAIRoutes(app));
app.use('/api/calendar', setupCalendarRoutes(app));
app.use('/api/analytics', setupAnalyticsRoutes(app));

// WebSocket
io.on('connection', (socket) => {
  console.log(`📡 User connected: ${socket.id}`);

  socket.on('join_room', async (roomId, userId) => {
    socket.join(roomId);
    socket.userId = userId;
    socket.roomId = roomId;
    
    io.to(roomId).emit('user_joined', {
      userId,
      timestamp: new Date()
    });

    // Load message history
    try {
      const messages = await prisma.chatMessage.findMany({
        where: { roomId },
        take: 50,
        orderBy: { createdAt: 'asc' },
        include: { author: { select: { id: true, email: true, firstName: true } } }
      });
      socket.emit('message_history', messages);
    } catch (err) {
      socket.emit('error', { message: 'Failed to load messages' });
    }
  });

  socket.on('send_message', async (data) => {
    try {
      const message = await prisma.chatMessage.create({
        data: {
          content: data.content,
          type: data.type || 'TEXT',
          authorId: socket.userId,
          roomId: data.roomId
        },
        include: { author: { select: { id: true, email: true, firstName: true } } }
      });
      
      io.to(data.roomId).emit('new_message', message);

      // Cache in Redis
      await redis.lpush(`room:${data.roomId}:messages`, JSON.stringify(message));
    } catch (err) {
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('typing', (data) => {
    io.to(data.roomId).emit('user_typing', {
      userId: socket.userId,
      isTyping: data.isTyping
    });
  });

  socket.on('disconnect', () => {
    if (socket.roomId) {
      io.to(socket.roomId).emit('user_left', {
        userId: socket.userId,
        timestamp: new Date()
      });
    }
    console.log(`📡 User disconnected: ${socket.id}`);
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Error Handler (must be last)
app.use(errorHandler);

// Graceful Shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  httpServer.close(async () => {
    if (prisma) await prisma.$disconnect();
    if (redis) redis.disconnect();
    process.exit(0);
  });
});

// Start Server
const PORT = process.env.PORT || 5000;

async function startServer() {
  await initializeConnections();
  
  httpServer.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║     🚀 CUTERUS BACKEND RUNNING 🚀     ║
╠════════════════════════════════════════╣
║ API:      http://localhost:${PORT}        ║
║ WebSocket: ws://localhost:${PORT}         ║
║ Docs:     /api/docs                   ║
╚════════════════════════════════════════╝
    `);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export { app, io };
