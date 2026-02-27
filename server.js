import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import environmentRoutes from './routes/environmentRoutes.js';
import riskRoutes from './routes/riskRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { protectRoute } from './middleware/protectRoute.js';
import zoneRoutes from './routes/zoneRoutes.js';
import droneRoutes from './routes/droneRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('CORS policy: Origin not allowed.'));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'FireGuard API is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/zones', protectRoute, zoneRoutes);
app.use('/api/environment', protectRoute, environmentRoutes);
app.use('/api/risk', protectRoute, riskRoutes);
app.use('/api/drones', protectRoute, droneRoutes);
app.use('/api/drone', protectRoute, droneRoutes);

app.use((err, _req, res, _next) => {
  if (err?.type === 'entity.too.large') {
    console.error('CAPTURE ERROR: Payload too large', err);
    return res.status(413).json({
      success: false,
      message: 'Payload too large. Reduce capture size and try again.',
    });
  }

  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: 'Unexpected server error.',
  });
});

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server due to DB connection error:', error.message);
    process.exit(1);
  });
