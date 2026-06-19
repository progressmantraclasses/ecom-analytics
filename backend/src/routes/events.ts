import { Router } from 'express';
import { ingestEvents } from '../controllers/eventsController';
import { ingestRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// POST /api/events — batch event ingestion
router.post('/', ingestRateLimiter, ingestEvents);

export default router;
