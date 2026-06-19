import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

const PAGE_META = {
  '/dashboard': { title: 'Overview', sub: 'Platform analytics at a glance' },
  '/sessions': { title: 'Sessions', sub: 'Browse and explore user sessions' },
  '/heatmap': { title: 'Heatmap', sub: 'Visualize click patterns on your pages' },
};

export default function TopBar() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const meta = PAGE_META[location.pathname] ??
    (location.pathname.startsWith('/sessions/') ? { title: 'Session Detail', sub: 'User journey timeline' } : { title: 'Dashboard', sub: '' });

  const handleRefresh = () => {
    queryClient.invalidateQueries();
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <span className="topbar-title">{meta.title}</span>
        {meta.sub && <span className="topbar-sub">{meta.sub}</span>}
      </div>
      <div className="topbar-right">
        <button
          className="topbar-btn"
          onClick={handleRefresh}
          title="Refresh data"
          aria-label="Refresh data"
        >
          <RefreshCw size={15} />
        </button>
        <button className="topbar-btn" title="Notifications" aria-label="Notifications">
          <Bell size={15} />
        </button>
      </div>
    </header>
  );
}
