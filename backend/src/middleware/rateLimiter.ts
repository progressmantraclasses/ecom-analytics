import rateLimit from 'express-rate-limit';
import { config } from '../config';
import { HTTP_STATUS, ERROR_CODES } from '../utils/constants';

export const ingestRateLimiter = rateLimit({
  windowMs: config.ingestRateLimit.windowMs,
  max: config.ingestRateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests, please try again later',
    code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
  skip: (req) => req.method === 'OPTIONS',
});

export const dashboardRateLimiter = rateLimit({
  windowMs: config.dashboardRateLimit.windowMs,
  max: config.dashboardRateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests, please try again later',
    code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
  skip: (req) => req.method === 'OPTIONS',
});
