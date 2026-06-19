import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { HTTP_STATUS, ERROR_CODES } from '../utils/constants';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  const statusCode = err.statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const code = err.code ?? ERROR_CODES.INTERNAL_ERROR;

  logger.error('Request error', {
    method: req.method,
    url: req.url,
    statusCode,
    error: err.message,
    stack: err.stack,
  });

  res.status(statusCode).json({
    success: false,
    error: err.message ?? 'Internal server error',
    code,
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    error: `Route ${req.method} ${req.url} not found`,
    code: ERROR_CODES.NOT_FOUND,
  });
};
