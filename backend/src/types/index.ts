import { EVENT_TYPES } from '../utils/constants';

export interface IEvent {
  _id?: string;
  session_id: string;
  event_type: (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];
  page_url: string;
  timestamp: Date;
  x?: number;
  y?: number;
  viewport_width?: number;
  viewport_height?: number;
  created_at: Date;
}

export interface ISession {
  _id: string; // session_id is the _id
  first_seen: Date;
  last_seen: Date;
  event_count: number;
  page_views: number;
  clicks: number;
  pages_visited: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StatsResponse {
  totalSessions: number;
  totalEvents: number;
  totalPageViews: number;
  totalClicks: number;
  eventsToday: number;
}

export interface HeatmapResponse {
  clicks: HeatmapClick[];
  page_url: string;
  total: number;
}

export interface HeatmapClick {
  x: number;
  y: number;
  viewport_width: number;
  viewport_height: number;
  timestamp: Date;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data?: T;
  inserted?: number;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code: string;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;
