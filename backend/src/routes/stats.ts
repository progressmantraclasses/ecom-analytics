import { Router } from 'express';
import { getStats, getEventsChart } from '../controllers/statsController';
import { dashboardRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// GET /api/stats — platform overview stats
router.get('/', dashboardRateLimiter, getStats);

// GET /api/stats/chart — events by day for line chart
router.get('/chart', dashboardRateLimiter, getEventsChart);

export default router;
