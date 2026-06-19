import { Router } from 'express';
import { getHeatmap, getHeatmapUrls } from '../controllers/heatmapController';
import { dashboardRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// GET /api/heatmap/urls — distinct page URLs with click data
router.get('/urls', dashboardRateLimiter, getHeatmapUrls);

// GET /api/heatmap — click data for heatmap rendering
router.get('/', dashboardRateLimiter, getHeatmap);

export default router;
