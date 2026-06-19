import { EventModel } from '../models/Event';
import { SessionModel } from '../models/Session';
import { EventPayload } from '../utils/validators';
import { EVENT_TYPES } from '../utils/constants';
import { cacheDeletePattern } from './cacheService';
import { logger } from '../utils/logger';

export const insertEvents = async (events: EventPayload[]): Promise<number> => {
  const docs = events.map((e) => ({
    session_id: e.session_id,
    event_type: e.event_type,
    page_url: e.page_url,
    timestamp: new Date(e.timestamp),
    x: e.x,
    y: e.y,
    viewport_width: e.viewport_width,
    viewport_height: e.viewport_height,
    created_at: new Date(),
  }));

  const result = await EventModel.insertMany(docs, { ordered: false });
  return result.length;
};

export const upsertSessionSummaries = async (events: EventPayload[]): Promise<void> => {
  // Group events by session_id
  const sessionMap = new Map<
    string,
    {
      events: EventPayload[];
      pageViews: number;
      clicks: number;
      pages: Set<string>;
    }
  >();

  for (const event of events) {
    const existing = sessionMap.get(event.session_id) ?? {
      events: [],
      pageViews: 0,
      clicks: 0,
      pages: new Set<string>(),
    };

    existing.events.push(event);
    existing.pages.add(event.page_url);

    if (event.event_type === EVENT_TYPES.PAGE_VIEW) {
      existing.pageViews += 1;
    } else if (event.event_type === EVENT_TYPES.CLICK) {
      existing.clicks += 1;
    }

    sessionMap.set(event.session_id, existing);
  }

  // Bulk upsert sessions
  const bulkOps = Array.from(sessionMap.entries()).map(([sessionId, data]) => {
    const timestamps = data.events.map((e) => new Date(e.timestamp));
    const minTs = new Date(Math.min(...timestamps.map((t) => t.getTime())));
    const maxTs = new Date(Math.max(...timestamps.map((t) => t.getTime())));

    return {
      updateOne: {
        filter: { _id: sessionId },
        update: {
          $setOnInsert: { first_seen: minTs },
          $set: { last_seen: maxTs },
          $inc: {
            event_count: data.events.length,
            page_views: data.pageViews,
            clicks: data.clicks,
          },
          $addToSet: {
            pages_visited: { $each: Array.from(data.pages) },
          },
        },
        upsert: true,
      },
    };
  });

  if (bulkOps.length > 0) {
    await SessionModel.bulkWrite(bulkOps, { ordered: false });

    // Invalidate sessions cache on new data
    await cacheDeletePattern('analytics:sessions:*');
    await cacheDeletePattern('analytics:stats');
  }
};

export const getEventsForSession = async (sessionId: string) => {
  return EventModel.find({ session_id: sessionId })
    .sort({ timestamp: 1 })
    .lean()
    .exec();
};

export const getHeatmapClicks = async (pageUrl: string, from?: string, to?: string) => {
  const filter: Record<string, unknown> = {
    page_url: pageUrl,
    event_type: EVENT_TYPES.CLICK,
  };

  if (from || to) {
    filter['timestamp'] = {};
    if (from) (filter['timestamp'] as Record<string, Date>)['$gte'] = new Date(from);
    if (to) (filter['timestamp'] as Record<string, Date>)['$lte'] = new Date(to);
  }

  return EventModel.find(filter)
    .select('x y viewport_width viewport_height timestamp -_id')
    .lean()
    .exec();
};

export const getDistinctPageUrls = async (): Promise<string[]> => {
  const urls = await EventModel.distinct('page_url', { event_type: EVENT_TYPES.CLICK });
  return urls as string[];
};

export const getPlatformStats = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalSessions,
    totalEvents,
    pageViewCount,
    clickCount,
    eventsToday,
  ] = await Promise.all([
    SessionModel.countDocuments().lean(),
    EventModel.countDocuments().lean(),
    EventModel.countDocuments({ event_type: EVENT_TYPES.PAGE_VIEW }).lean(),
    EventModel.countDocuments({ event_type: EVENT_TYPES.CLICK }).lean(),
    EventModel.countDocuments({ timestamp: { $gte: today } }).lean(),
  ]);

  return {
    totalSessions,
    totalEvents,
    totalPageViews: pageViewCount,
    totalClicks: clickCount,
    eventsToday,
  };
};

export const getEventsByDay = async (days = 7) => {
  const from = new Date();
  from.setDate(from.getDate() - days);
  from.setHours(0, 0, 0, 0);

  const result = await EventModel.aggregate([
    { $match: { timestamp: { $gte: from } } },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  logger.debug('Events by day', { result });
  return result;
};
