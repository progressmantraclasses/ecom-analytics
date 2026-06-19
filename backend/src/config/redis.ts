import Redis from 'ioredis';
import { Redis as UpstashRedis } from '@upstash/redis';
import { config } from './index';
import { logger } from '../utils/logger';

export interface IRedisClient {
  get(key: string): Promise<string | null>;
  setex(key: string, ttlSeconds: number, value: string): Promise<unknown>;
  del(...keys: string[]): Promise<unknown>;
  keys(pattern: string): Promise<string[]>;
}

let redisClient: IRedisClient | null = null;
let isUpstashClient = false;

export const getRedisClient = (): IRedisClient | null => {
  return redisClient;
};

export const connectRedis = async (): Promise<void> => {
  try {
    if (config.upstashRedisRestUrl && config.upstashRedisRestToken) {
      logger.info('Initializing Upstash Redis client...');
      const client = new UpstashRedis({
        url: config.upstashRedisRestUrl,
        token: config.upstashRedisRestToken,
        automaticDeserialization: false,
      });

      // Verify connection by making a ping request
      await client.ping();

      redisClient = client;
      isUpstashClient = true;
      logger.info('Upstash Redis connected successfully');
    } else {
      logger.info('Initializing ioredis client...');
      const ioredisClient = new Redis(config.redisUrl, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        lazyConnect: true,
      });

      await ioredisClient.connect();

      ioredisClient.on('error', (error) => {
        logger.error('Redis connection error', { error: error.message });
      });

      ioredisClient.on('connect', () => {
        logger.info('Redis connected successfully');
      });

      ioredisClient.on('reconnecting', () => {
        logger.warn('Redis reconnecting...');
      });

      redisClient = ioredisClient;
      isUpstashClient = false;
      logger.info('Redis connected successfully');
    }
  } catch (error) {
    logger.warn('Redis connection failed — caching disabled', {
      error: error instanceof Error ? error.message : String(error),
    });
    redisClient = null;
  }
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient) {
    if (!isUpstashClient && 'quit' in redisClient && typeof (redisClient as any).quit === 'function') {
      await (redisClient as any).quit();
    }
    redisClient = null;
    logger.info('Redis disconnected');
  }
};
