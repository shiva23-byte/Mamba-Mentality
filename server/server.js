require('dotenv').config();

// Override DNS to use Google's public DNS servers
// (fixes mongodb+srv:// resolution on restricted campus/corporate networks)
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const cron = require('node-cron');
const connectDB = require('./config/db');
const UserDay = require('./models/UserDay');

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

const checkOrigin = (origin, callback) => {
  if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.includes('localhost')) {
    callback(null, true);
  } else {
    callback(new Error('Not allowed by CORS'));
  }
};

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: checkOrigin,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  },
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(cors({
  origin: checkOrigin,
}));
app.use(express.json());

// Routes
const activitiesRouter = require('./routes/activities');
const coachRouter = require('./routes/coach');

app.use('/api/activities', activitiesRouter);
app.use('/api/coach', coachRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log(`\x1b[35m[Socket.IO]\x1b[0m Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`\x1b[35m[Socket.IO]\x1b[0m Client disconnected: ${socket.id}`);
  });
});

// Cron job: Check for lagging activities every 30 minutes
cron.schedule('*/30 * * * *', async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const day = await UserDay.findOne({ date: today });

    if (day) {
      const laggingActivities = day.activities.filter(
        (a) => a.status !== 'completed' && a.actualMinutes < a.plannedMinutes
      );

      if (laggingActivities.length > 0) {
        io.emit('lagging-alert', {
          message: `⚠️ ${laggingActivities.length} activit${laggingActivities.length === 1 ? 'y is' : 'ies are'} lagging behind schedule!`,
          activities: laggingActivities.map((a) => ({
            name: a.name,
            gap: a.plannedMinutes - a.actualMinutes,
          })),
        });
        console.log(`\x1b[33m[Cron]\x1b[0m Lagging alert sent for ${laggingActivities.length} activities`);
      }
    }
  } catch (error) {
    console.error('[Cron] Error checking activities:', error.message);
  }
});

// Middleware to ensure DB connection on serverless environments (Vercel)
let cachedDB = null;
app.use(async (req, res, next) => {
  if (!cachedDB) {
    try {
      cachedDB = await connectDB();
    } catch (err) {
      console.error('[Vercel] DB Connection middleware failed:', err.message);
    }
  }
  next();
});

// Start
const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`
\x1b[36m╔══════════════════════════════════════════╗
║         🐍 MAMBA TRACKER SERVER 🐍       ║
║──────────────────────────────────────────║
║  Port: ${String(PORT).padEnd(33)}║
║  Mode: ${(process.env.NODE_ENV || 'development').padEnd(33)}║
║  Gemini: ${(process.env.GEMINI_API_KEY ? '✅ Configured' : '⚠️  Stub mode').padEnd(31)}║
║  ElevenLabs: ${(process.env.ELEVENLABS_API_KEY ? '✅ Configured' : '⚠️  Stub mode').padEnd(28)}║
╚══════════════════════════════════════════╝\x1b[0m
    `);
  });
}

// Only start the HTTP listener if not on Vercel
if (!process.env.VERCEL) {
  start();
}

module.exports = app;
