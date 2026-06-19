import { Request, Response } from 'express';
import { HeatmapQuerySchema } from '../utils/validators';
import { getHeatmapClicks, getDistinctPageUrls } from '../services/eventService';
import { withCache } from '../services/cacheService';
import { CACHE_KEYS, HTTP_STATUS, ERROR_CODES } from '../utils/constants';
import { config } from '../config';

export const getHeatmap = async (req: Request, res: Response): Promise<void> => {
  const parsed = HeatmapQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: parsed.error.issues.map((i) => i.message).join('; '),
      code: ERROR_CODES.VALIDATION_ERROR,
    });
    return;
  }

  const { page_url, from, to } = parsed.data;
  const cacheKey = CACHE_KEYS.HEATMAP(page_url, from ?? '', to ?? '');

  const result = await withCache(
    cacheKey,
    config.cacheTTL.heatmap,
    async () => {
      const clicks = await getHeatmapClicks(page_url, from, to);
      return {
        clicks,
        page_url,
        total: clicks.length,
      };
    }
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    ...result,
  });
};

export const getHeatmapUrls = async (_req: Request, res: Response): Promise<void> => {
  const cacheKey = CACHE_KEYS.HEATMAP_URLS;

  const urls = await withCache(cacheKey, config.cacheTTL.heatmap, () =>
    getDistinctPageUrls()
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    urls,
  });
};
