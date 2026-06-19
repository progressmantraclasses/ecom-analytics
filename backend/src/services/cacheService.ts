import { getRedisClient } from '../config/redis';
import { logger } from '../utils/logger';

export const cacheGet = async <T>(key: string): Promise<T | null> => {
  const redis = getRedisClient();
  if (!redis) return null;

  try {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
    return null;
  } catch (error) {
    logger.warn('Cache get failed', { key, error: error instanceof Error ? error.message : String(error) });
    return null;
  }
};

export const cacheSet = async (key: string, value: unknown, ttlSeconds: number): Promise<void> => {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  } catch (error) {
    logger.warn('Cache set failed', { key, error: error instanceof Error ? error.message : String(error) });
  }
};

export const cacheDelete = async (key: string): Promise<void> => {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    await redis.del(key);
  } catch (error) {
    logger.warn('Cache delete failed', { key, error: error instanceof Error ? error.message : String(error) });
  }
};

export const cacheDeletePattern = async (pattern: string): Promise<void> => {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    logger.warn('Cache delete pattern failed', {
      pattern,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const withCache = async <T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> => {
  const cached = await cacheGet<T>(key);
  if (cached !== null) {
    return cached;
  }

  const data = await fetcher();
  await cacheSet(key, data, ttlSeconds);
  return data;
};
