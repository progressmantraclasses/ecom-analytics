export const CACHE_KEYS = {
  STATS: 'analytics:stats',
  SESSIONS_LIST: (page: number, limit: number, sort: string, order: string) =>
    `analytics:sessions:list:${page}:${limit}:${sort}:${order}`,
  SESSION_EVENTS: (sessionId: string) => `analytics:session:events:${sessionId}`,
  HEATMAP: (pageUrl: string, from: string, to: string) =>
    `analytics:heatmap:${Buffer.from(pageUrl).toString('base64')}:${from}:${to}`,
  HEATMAP_URLS: 'analytics:heatmap:urls',
} as const;

export const EVENT_TYPES = {
  PAGE_VIEW: 'page_view',
  CLICK: 'click',
} as const;

export const SORT_FIELDS = ['last_seen', 'first_seen', 'event_count', 'page_views', 'clicks'] as const;

export const SORT_ORDERS = ['asc', 'desc'] as const;

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const MAX_BATCH_SIZE = 500;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INVALID_PAYLOAD: 'INVALID_PAYLOAD',
} as const;
