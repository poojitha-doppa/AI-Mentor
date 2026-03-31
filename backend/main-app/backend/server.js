import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectMongo } from './db/mongo.js';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the backend folder
dotenv.config({ path: path.join(__dirname, '.env') });

// Import routes
import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import roadmapRoutes from './routes/roadmaps.js';
import skillEvalRoutes from './routes/skillEval.js';
import profileRoutes from './routes/profile.js';
import adminRoutes from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:4173', 
    'http://localhost:3002', 
    'http://localhost:5173', 
    'http://localhost:3001',
    'https://careersync-landing.onrender.com',
    'https://careersync-course-gen.onrender.com',
    'https://careersync-roadmap.onrender.com',
    'https://careersync-landing-oldo.onrender.com',
    'https://careersync-course-gen-oldo.onrender.com',
    'https://careersync-roadmap-oldo.onrender.com',
    'https://career-sync-skill-evalutor.onrender.com'
  ],
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'SkillRoute Backend is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/skills', skillEvalRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Something went wrong!', 
    message: err.message 
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

connectMongo().then((connected) => {
  app.listen(PORT, () => {
    console.log(`\n🚀 Career Sync Backend running on port ${PORT}`);
    console.log(`📡 API endpoint: http://localhost:${PORT}`);
    console.log(`✅ CORS enabled for frontend origins`);
    if (connected) {
      console.log(`✅ MongoDB: Connected`);
    } else {
      console.log(`⚠️  MongoDB: Not connected (using localStorage only)`);
      console.log(`🔧 Fix MongoDB: https://cloud.mongodb.com/`);
    }
    console.log(`⏰ Server started at ${new Date().toISOString()}\n`);
  });
}).catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
