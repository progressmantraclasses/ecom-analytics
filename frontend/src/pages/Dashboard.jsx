import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, MousePointer, BarChart2, Activity, ChevronRight } from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import EventsChart from '../components/dashboard/EventsChart';
import SessionsTable from '../components/sessions/SessionsTable';
import { SkeletonStatCard } from '../components/shared/SkeletonLoader';
import { useStats, useEventsChart } from '../hooks/useStats';
import { useSessions } from '../hooks/useSessions';

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading, error: statsError } = useStats();
  const { data: chartData, isLoading: chartLoading } = useEventsChart();
  const { data: sessionsData, isLoading: sessionsLoading } = useSessions({ page: 1, limit: 10 });

  const statCards = [
    { key: 'totalSessions', label: 'Total Sessions', icon: Users, colorClass: 'indigo', trend: 12 },
    { key: 'totalEvents', label: 'Total Events', icon: BarChart2, colorClass: 'cyan', trend: 8 },
    { key: 'totalPageViews', label: 'Page Views', icon: Activity, colorClass: 'green', trend: 5 },
    { key: 'totalClicks', label: 'Total Clicks', icon: MousePointer, colorClass: 'amber', trend: 15 },
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Analytics Overview</h1>
        <p className="page-sub">Real-time insights into your users' behavior</p>
      </div>

      {/* STATS GRID */}
      <div className="stats-grid">
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)
          : statCards.map(({ key, label, icon, colorClass, trend }) => (
              <StatsCard
                key={key}
                label={label}
                value={stats?.[key] ?? 0}
                icon={icon}
                colorClass={colorClass}
                trend={trend}
              />
            ))}
      </div>

      {/* CHARTS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', marginBottom: '24px' }}>
        {/* Events over time */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Events Over Time</div>
              <div className="card-sub">Last 7 days</div>
            </div>
            <span className="badge badge-primary">
              <Activity size={10} /> Live
            </span>
          </div>
          <div className="chart-container">
            <EventsChart data={chartData?.data} isLoading={chartLoading} />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="card card-padding">
          <div className="card-title" style={{ marginBottom: '16px' }}>Today's Snapshot</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: "Events Today", value: stats?.eventsToday ?? 0, color: 'var(--primary-light)' },
              { label: "Active Sessions", value: stats?.totalSessions ?? 0, color: 'var(--secondary)' },
              { label: "Avg Clicks/Session", value: stats?.totalSessions ? Math.round((stats?.totalClicks ?? 0) / stats.totalSessions) : 0, color: 'var(--success)' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border)',
              }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{label}</span>
                <span style={{ fontSize: '18px', fontWeight: '700', color }}>{value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RECENT SESSIONS */}
      <div className="card">
        <div className="card-header" style={{ marginBottom: '4px' }}>
          <div>
            <div className="card-title">Recent Sessions</div>
            <div className="card-sub">Latest 10 user sessions</div>
          </div>
          <button
            className="btn btn-ghost"
            onClick={() => navigate('/sessions')}
            style={{ fontSize: '13px' }}
          >
            View all <ChevronRight size={14} />
          </button>
        </div>
        <SessionsTable
          sessions={sessionsData?.sessions}
          isLoading={sessionsLoading}
        />
      </div>
    </div>
  );
}
