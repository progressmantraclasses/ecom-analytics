import React from 'react';
import { Globe, MousePointer, Clock } from 'lucide-react';
import { formatRelativeTime, formatAbsoluteTime, truncateUrl } from '../../lib/utils';
import { SkeletonTimelineItem } from '../shared/SkeletonLoader';

function TimelineItem({ event, index }) {
  const isPageView = event.event_type === 'page_view';

  return (
    <div className="timeline-item" style={{ animationDelay: `${index * 60}ms` }}>
      <div className={`timeline-dot ${event.event_type}`} />
      <div className="timeline-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <span
            className={`badge ${isPageView ? 'badge-cyan' : 'badge-primary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            {isPageView ? <Globe size={10} /> : <MousePointer size={10} />}
            {event.event_type === 'page_view' ? 'Page View' : 'Click'}
          </span>
          <span title={formatAbsoluteTime(event.timestamp)}
            style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Clock size={10} />
            {formatRelativeTime(event.timestamp)}
          </span>
        </div>

        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px', wordBreak: 'break-all' }}>
          <span style={{ color: 'var(--text-subtle)', marginRight: '6px' }}>URL</span>
          {truncateUrl(event.page_url, 60)}
        </div>

        {event.event_type === 'click' && event.x != null && (
          <div style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>
            <span style={{ color: 'var(--primary-light)', fontFamily: 'monospace' }}>
              x: {Math.round(event.x)}, y: {Math.round(event.y)}
            </span>
            {event.viewport_width && (
              <span style={{ marginLeft: '10px' }}>
                viewport: {event.viewport_width} × {event.viewport_height}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function EventTimeline({ events, isLoading }) {
  if (isLoading) {
    return (
      <div className="timeline">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonTimelineItem key={i} />
        ))}
      </div>
    );
  }

  if (!events?.length) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '14px' }}>
        No events found for this session
      </div>
    );
  }

  return (
    <div className="timeline">
      {events.map((event, i) => (
        <TimelineItem key={event._id ?? i} event={event} index={i} />
      ))}
    </div>
  );
}
