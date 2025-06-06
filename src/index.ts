import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import postRoutes from './routes/postRoutes';
import bookmarkRoutes from './routes/bookmarkRoutes';
import notificationRoutes from './routes/notificationRoutes';
import messagesRoutes from './routes/messagesRoutes';
import interactionRoutes from './routes/interactionRoutes';
import pool from './config/db'; // Changed to explicit import

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messagesRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Database connection check
app.get('/api/db-check', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ database: 'connected' });
  } catch (err) {
    res.status(500).json({ database: 'disconnected' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});