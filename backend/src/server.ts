import app from './app';
import { config } from './config';
import { connectDatabase, disconnectDatabase } from './config/database';
import { connectRedis, disconnectRedis } from './config/redis';
import { logger } from './utils/logger';

const shutdown = async (signal: string): Promise<void> => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  await Promise.all([disconnectDatabase(), disconnectRedis()]);
  process.exit(0);
};

const startServer = async (): Promise<void> => {
  // Connect to databases
  await connectDatabase();
  await connectRedis();

  const server = app.listen(config.port, () => {
    logger.info(`CF Analytics Backend running`, {
      port: config.port,
      env: config.nodeEnv,
      url: `http://localhost:${config.port}`,
    });
  });

  // Graceful shutdown handlers
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled rejection', {
      reason: String(reason),
      promise: String(promise),
    });
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', { error: error.message, stack: error.stack });
    shutdown('uncaughtException').catch(() => process.exit(1));
  });

  return new Promise((resolve) => {
    server.on('listening', resolve);
  });
};

startServer().catch((error) => {
  logger.error('Failed to start server', { error: String(error) });
  process.exit(1);
});
