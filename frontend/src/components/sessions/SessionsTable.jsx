import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, MousePointer, Globe, ChevronRight } from 'lucide-react';
import { formatRelativeTime, truncateId } from '../../lib/utils';
import { SkeletonTable } from '../shared/SkeletonLoader';
import EmptyState from '../shared/EmptyState';

export default function SessionsTable({ sessions, isLoading, showPagination = false }) {
  const navigate = useNavigate();

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Session ID</th>
            <th>Events</th>
            <th>Page Views</th>
            <th>Clicks</th>
            <th>Last Seen</th>
            <th></th>
          </tr>
        </thead>
        {isLoading ? (
          <SkeletonTable rows={8} cols={6} />
        ) : sessions?.length === 0 ? (
          <tbody>
            <tr>
              <td colSpan={6}>
                <EmptyState variant="noSessions" />
              </td>
            </tr>
          </tbody>
        ) : (
          <tbody>
            {sessions?.map((session) => (
              <tr
                key={session._id}
                onClick={() => navigate(`/sessions/${session._id}`)}
                style={{ cursor: 'pointer' }}
              >
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '8px',
                      background: 'rgba(99,102,241,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Globe size={12} color="var(--primary-light)" />
                    </div>
                    <code style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {truncateId(session._id, 12)}
                    </code>
                  </div>
                </td>
                <td>
                  <span className="badge badge-primary">{session.event_count}</span>
                </td>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--secondary)', fontSize: '13px' }}>
                    <Eye size={12} /> {session.page_views}
                  </span>
                </td>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--primary-light)', fontSize: '13px' }}>
                    <MousePointer size={12} /> {session.clicks}
                  </span>
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                  {formatRelativeTime(session.last_seen)}
                </td>
                <td>
                  <button
                    className="btn btn-ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/sessions/${session._id}`);
                    }}
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                    aria-label={`View session ${session._id}`}
                  >
                    <ChevronRight size={14} />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        )}
      </table>
    </div>
  );
}
