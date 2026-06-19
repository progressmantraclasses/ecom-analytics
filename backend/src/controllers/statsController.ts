import { Request, Response } from 'express';
import { getPlatformStats, getEventsByDay } from '../services/eventService';
import { withCache } from '../services/cacheService';
import { CACHE_KEYS, HTTP_STATUS } from '../utils/constants';
import { config } from '../config';

export const getStats = async (_req: Request, res: Response): Promise<void> => {
  const stats = await withCache(CACHE_KEYS.STATS, config.cacheTTL.stats, () =>
    getPlatformStats()
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    ...stats,
  });
};

export const getEventsChart = async (_req: Request, res: Response): Promise<void> => {
  const data = await getEventsByDay(7);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data,
  });
};
