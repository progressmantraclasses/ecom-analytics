import 'express-async-errors';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';

import { config } from './config';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import eventsRouter from './routes/events';
import sessionsRouter from './routes/sessions';
import heatmapRouter from './routes/heatmap';
import statsRouter from './routes/stats';

const app = express();

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS
// Allow the event ingestion endpoint to accept events from any origin (as it is a tracking script)
app.use(
  '/api/events',
  cors({
    origin: '*',
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  })
);

// Apply standard restricted CORS to dashboard routes
app.use(
  cors({
    origin: (origin, callback) => {
      // In development, also allow null origin (direct file opening) or any localhost port
      if (!origin || origin === 'null') {
        callback(null, true);
        return;
      }
      const allowedOrigins = config.corsOrigin.split(',').map((o) => o.trim());
      const isLocalhost = origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:');
      if (allowedOrigins.includes(origin) || (config.isDev && isLocalhost)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'cf-analytics-backend',
    version: '1.0.0',
  });
});

// API routes
app.use('/api/events', eventsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/heatmap', heatmapRouter);
app.use('/api/stats', statsRouter);

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
