import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = ['MONGODB_URI', 'REDIS_URL'] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`Warning: ${envVar} is not set. Using default.`);
  }
}

export const config = {
  port: parseInt(process.env['PORT'] ?? '5000', 10),
  mongodbUri: process.env['MONGODB_URI'] ?? 'mongodb://localhost:27017/analytics',
  redisUrl: process.env['REDIS_URL'] ?? 'redis://localhost:6379',
  upstashRedisRestUrl: process.env['UPSTASH_REDIS_REST_URL'] ?? null,
  upstashRedisRestToken: process.env['UPSTASH_REDIS_REST_TOKEN'] ?? null,
  corsOrigin: process.env['CORS_ORIGIN'] ?? 'http://localhost:5173',
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  logLevel: process.env['LOG_LEVEL'] ?? 'info',
  isDev: (process.env['NODE_ENV'] ?? 'development') === 'development',
  isProd: process.env['NODE_ENV'] === 'production',

  // Rate limiting
  ingestRateLimit: {
    windowMs: 60 * 1000, // 1 minute
    max: 100,
  },
  dashboardRateLimit: {
    windowMs: 60 * 1000,
    max: 30,
  },

  // Cache TTLs (seconds)
  cacheTTL: {
    stats: 10,
    sessionsList: 30,
    sessionEvents: 60,
    heatmap: 30,
  },

  // MongoDB
  mongooseOptions: {
    maxPoolSize: 100,
    minPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  },

  // Session
  sessionInactivityMs: 30 * 60 * 1000, // 30 minutes
} as const;
