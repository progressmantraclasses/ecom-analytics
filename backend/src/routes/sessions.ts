import { Router } from 'express';
import { listSessions, getSessionEvents } from '../controllers/sessionsController';
import { dashboardRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// GET /api/sessions — paginated sessions list
router.get('/', dashboardRateLimiter, listSessions);

// GET /api/sessions/:sessionId/events — session event timeline
router.get('/:sessionId/events', dashboardRateLimiter, getSessionEvents);

export default router;
