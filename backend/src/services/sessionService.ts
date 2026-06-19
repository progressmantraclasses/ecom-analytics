import { SessionModel } from '../models/Session';
import { PaginationQuery } from '../utils/validators';

export interface SessionRecord {
  _id: string;
  first_seen: Date;
  last_seen: Date;
  event_count: number;
  page_views: number;
  clicks: number;
  pages_visited: string[];
}

export interface PaginatedSessions {
  sessions: SessionRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getPaginatedSessions = async (query: PaginationQuery): Promise<PaginatedSessions> => {
  const { page, limit, sort, order } = query;
  const skip = (page - 1) * limit;
  const sortOrder = order === 'desc' ? -1 : 1;

  const [sessions, total] = await Promise.all([
    SessionModel.find()
      .sort({ [sort]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean<SessionRecord[]>()
      .exec(),
    SessionModel.countDocuments(),
  ]);

  return {
    sessions,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const getSessionById = async (sessionId: string): Promise<SessionRecord | null> => {
  return SessionModel.findById(sessionId).lean<SessionRecord>().exec();
};
