import { Request, Response } from 'express';
import { BatchEventsSchema } from '../utils/validators';
import { insertEvents, upsertSessionSummaries } from '../services/eventService';
import { HTTP_STATUS, ERROR_CODES } from '../utils/constants';
import { logger } from '../utils/logger';

export const ingestEvents = async (req: Request, res: Response): Promise<void> => {
  const parsed = BatchEventsSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: parsed.error.issues.map((i) => i.message).join('; '),
      code: ERROR_CODES.VALIDATION_ERROR,
    });
    return;
  }

  const { events } = parsed.data;

  const [insertedCount] = await Promise.all([
    insertEvents(events),
    upsertSessionSummaries(events),
  ]);

  logger.info('Events ingested', {
    count: insertedCount,
    sessions: new Set(events.map((e) => e.session_id)).size,
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    inserted: insertedCount,
  });
};
