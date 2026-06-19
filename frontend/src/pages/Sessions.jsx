import React, { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import SessionsTable from '../components/sessions/SessionsTable';
import Pagination from '../components/shared/Pagination';
import { useSessions } from '../hooks/useSessions';

const SORT_OPTIONS = [
  { value: 'last_seen', label: 'Last Seen' },
  { value: 'first_seen', label: 'First Seen' },
  { value: 'event_count', label: 'Event Count' },
  { value: 'clicks', label: 'Clicks' },
];

export default function Sessions() {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('last_seen');
  const [order, setOrder] = useState('desc');
  const limit = 20;

  const { data, isLoading } = useSessions({ page, limit, sort, order });

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Sessions</h1>
        <p className="page-sub">
          {data?.total != null ? `${data.total.toLocaleString()} total sessions` : 'Browse all user sessions'}
        </p>
      </div>

      {/* FILTERS */}
      <div className="card card-padding" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
            <SlidersHorizontal size={15} />
            Sort by:
          </div>
          <select
            className="input select"
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            style={{ width: '160px' }}
            aria-label="Sort by"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select
            className="input select"
            value={order}
            onChange={(e) => { setOrder(e.target.value); setPage(1); }}
            style={{ width: '120px' }}
            aria-label="Sort order"
          >
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>

          {data?.total != null && (
            <span className="badge badge-primary" style={{ marginLeft: 'auto' }}>
              Page {page} of {data.totalPages}
            </span>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <SessionsTable sessions={data?.sessions} isLoading={isLoading} />
        {!isLoading && data?.totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={data.totalPages}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
