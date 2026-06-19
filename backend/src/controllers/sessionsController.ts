import { Request, Response } from 'express';
import { PaginationSchema } from '../utils/validators';
import { getPaginatedSessions, getSessionById } from '../services/sessionService';
import { getEventsForSession } from '../services/eventService';
import { withCache } from '../services/cacheService';
import { CACHE_KEYS, HTTP_STATUS, ERROR_CODES } from '../utils/constants';
import { config } from '../config';

export const listSessions = async (req: Request, res: Response): Promise<void> => {
  const parsed = PaginationSchema.safeParse(req.query);

  if (!parsed.success) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: parsed.error.issues.map((i) => i.message).join('; '),
      code: ERROR_CODES.VALIDATION_ERROR,
    });
    return;
  }

  const query = parsed.data;
  const cacheKey = CACHE_KEYS.SESSIONS_LIST(query.page, query.limit, query.sort, query.order);

  const result = await withCache(cacheKey, config.cacheTTL.sessionsList, () =>
    getPaginatedSessions(query)
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    ...result,
  });
};

export const getSessionEvents = async (req: Request, res: Response): Promise<void> => {
  const { sessionId } = req.params;

  if (!sessionId) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'sessionId is required',
      code: ERROR_CODES.VALIDATION_ERROR,
    });
    return;
  }

  const session = await getSessionById(sessionId);

  if (!session) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      error: 'Session not found',
      code: ERROR_CODES.NOT_FOUND,
    });
    return;
  }

  const cacheKey = CACHE_KEYS.SESSION_EVENTS(sessionId);

  const events = await withCache(cacheKey, config.cacheTTL.sessionEvents, () =>
    getEventsForSession(sessionId)
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    events,
    session,
  });
};
