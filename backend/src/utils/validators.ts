import { z } from 'zod';
import { EVENT_TYPES } from '../utils/constants';

export const EventPayloadSchema = z.object({
  session_id: z.string().uuid('session_id must be a valid UUID v4'),
  event_type: z.enum([EVENT_TYPES.PAGE_VIEW, EVENT_TYPES.CLICK], {
    errorMap: () => ({ message: 'event_type must be page_view or click' }),
  }),
  page_url: z.string().url('page_url must be a valid URL').max(2048),
  timestamp: z.string().datetime({ message: 'timestamp must be ISO 8601 UTC' }),
  x: z.number().optional(),
  y: z.number().optional(),
  viewport_width: z.number().positive().optional(),
  viewport_height: z.number().positive().optional(),
});

export const BatchEventsSchema = z.object({
  events: z
    .array(EventPayloadSchema)
    .min(1, 'At least one event is required')
    .max(500, 'Maximum 500 events per batch'),
});

export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z
    .enum(['last_seen', 'first_seen', 'event_count', 'page_views', 'clicks'])
    .default('last_seen'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const HeatmapQuerySchema = z.object({
  page_url: z.string().url('page_url must be a valid URL'),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export type EventPayload = z.infer<typeof EventPayloadSchema>;
export type BatchEventsPayload = z.infer<typeof BatchEventsSchema>;
export type PaginationQuery = z.infer<typeof PaginationSchema>;
export type HeatmapQuery = z.infer<typeof HeatmapQuerySchema>;
