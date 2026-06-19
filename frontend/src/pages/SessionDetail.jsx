import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Globe, MousePointer, Clock, Activity, Monitor, Eye } from 'lucide-react';
import EventTimeline from '../components/sessions/EventTimeline';
import HeatmapCanvas from '../components/heatmap/HeatmapCanvas';
import { useSessionDetail } from '../hooks/useSessions';
import { formatAbsoluteTime, getSessionDuration, copyToClipboard } from '../lib/utils';

// Helper to format milliseconds to readable duration
const formatDuration = (ms) => {
  if (ms < 1000) return '< 1s';
  const totalSecs = Math.round(ms / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
};

// Helper to parse page activity and estimate durations
const getPagesBreakdown = (events) => {
  if (!events || events.length === 0) return [];

  // Sort events chronologically (oldest first) to accurately trace path durations
  const sortedEvents = [...events].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const pagesMap = {};

  sortedEvents.forEach((event, index) => {
    const url = event.page_url;
    if (!pagesMap[url]) {
      pagesMap[url] = {
        url,
        clicks: 0,
        pageViews: 0,
        firstEventTime: new Date(event.timestamp),
        lastEventTime: new Date(event.timestamp),
        viewportWidth: event.viewport_width || null,
        viewportHeight: event.viewport_height || null,
        estimatedTimeMs: 0
      };
    }

    const pageData = pagesMap[url];
    const eventTime = new Date(event.timestamp);

    if (eventTime < pageData.firstEventTime) pageData.firstEventTime = eventTime;
    if (eventTime > pageData.lastEventTime) pageData.lastEventTime = eventTime;

    if (event.event_type === 'click') {
      pageData.clicks += 1;
    } else if (event.event_type === 'page_view') {
      pageData.pageViews += 1;
    }

    if (event.viewport_width) pageData.viewportWidth = event.viewport_width;
    if (event.viewport_height) pageData.viewportHeight = event.viewport_height;

    // Estimate time: difference to next activity, capped at 10 minutes (ignoring backgrounded tabs)
    if (index < sortedEvents.length - 1) {
      const nextTime = new Date(sortedEvents[index + 1].timestamp);
      const diffMs = nextTime - eventTime;
      if (diffMs > 0 && diffMs < 10 * 60 * 1000) {
        pageData.estimatedTimeMs += diffMs;
      }
    } else {
      // Last event gets a safe default reading time
      pageData.estimatedTimeMs += 5000;
    }
  });

  return Object.values(pagesMap);
};

export default function SessionDetail() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline' | 'heatmap' | 'breakdown'
  const [heatmapUrl, setHeatmapUrl] = useState('');

  const { data, isLoading, error } = useSessionDetail(sessionId);

  const handleCopy = async () => {
    const ok = await copyToClipboard(sessionId);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const events = data?.events ?? [];
  const session = data?.session;

  // Set default page URL for visual heatmap once events load
  useEffect(() => {
    const urls = Array.from(new Set(events.map((e) => e.page_url)));
    if (urls.length > 0 && !heatmapUrl) {
      setHeatmapUrl(urls[0]);
    }
  }, [events, heatmapUrl]);

  if (error) {
    return (
      <div className="page-wrapper">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', gap: '16px' }}>
          <div style={{ fontSize: '48px' }}>⚠️</div>
          <h2 style={{ fontSize: '20px', fontWeight: '600' }}>Session not found</h2>
          <p style={{ color: 'var(--text-muted)' }}>The session ID you're looking for doesn't exist.</p>
          <button className="btn btn-primary" onClick={() => navigate('/sessions')}>
            <ArrowLeft size={15} /> Back to Sessions
          </button>
        </div>
      </div>
    );
  }

  // Calculate detailed page metrics
  const pagesBreakdown = getPagesBreakdown(events);
  const uniquePages = pagesBreakdown.length;
  const duration = session ? getSessionDuration(session.first_seen, session.last_seen) : '—';
  
  // Filter clicks specific to selected URL for the visual heatmap
  const sessionClicksForUrl = events.filter(
    (e) => e.event_type === 'click' && e.page_url === heatmapUrl
  );

  return (
    <div className="page-wrapper">
      {/* BREADCRUMB */}
      <button
        className="btn btn-ghost"
        onClick={() => navigate('/sessions')}
        style={{ marginBottom: '20px', fontSize: '13px' }}
        aria-label="Back to sessions"
      >
        <ArrowLeft size={14} /> Back to Sessions
      </button>

      {/* HEADER CARD */}
      <div className="card card-padding" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Activity size={22} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
              <h1 style={{ fontSize: '17px', fontWeight: '700' }}>Session Detail</h1>
              <span className="badge badge-primary">{events.length} events</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <code style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {sessionId}
              </code>
              <button
                className="copy-btn"
                onClick={handleCopy}
                title="Copy session ID"
                aria-label="Copy session ID"
              >
                {copied ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
              </button>
            </div>
            {session && (
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                {formatAbsoluteTime(session.first_seen)} → {formatAbsoluteTime(session.last_seen)}
              </p>
            )}
          </div>
        </div>

        {/* SESSION STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', marginTop: '20px' }}>
          {[
            { icon: Activity, label: 'Total Events', value: events.length, color: 'var(--primary-light)' },
            { icon: Globe, label: 'Unique Pages', value: uniquePages, color: 'var(--secondary)' },
            { icon: MousePointer, label: 'Clicks', value: session?.clicks ?? 0, color: 'var(--warning)' },
            { icon: Clock, label: 'Duration', value: duration, color: 'var(--success)' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} style={{
              padding: '14px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              textAlign: 'center',
            }}>
              <Icon size={16} color={color} style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '20px', fontWeight: '700', color }}>{value}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* INTERACTIVE NAVIGATION TABS */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { id: 'timeline', label: 'User Journey Feed', count: events.length },
          { id: 'heatmap', label: 'Session Heatmap', count: events.filter((e) => e.event_type === 'click').length },
          { id: 'breakdown', label: 'Page Performance', count: pagesBreakdown.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: '10px', padding: '8px 16px', fontSize: '13px' }}
          >
            {tab.label}
            <span className="badge" style={{
              marginLeft: '6px',
              background: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)',
              color: activeTab === tab.id ? 'white' : 'var(--text-muted)'
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* TAB CONTENT: TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="card card-padding">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600' }}>User Journey</h2>
            <span className="badge badge-cyan">{events.length} events</span>
          </div>
          <EventTimeline events={events} isLoading={isLoading} />
        </div>
      )}

      {/* TAB CONTENT: VISUAL HEATMAP */}
      {activeTab === 'heatmap' && (
        <div className="card card-padding">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '600' }}>Session Click Heatmap</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Visualize coordinates clicked by this user during this session
              </p>
            </div>
            {pagesBreakdown.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Page URL:</span>
                <select
                  className="input select"
                  value={heatmapUrl}
                  onChange={(e) => setHeatmapUrl(e.target.value)}
                  style={{ width: '280px', height: '38px', padding: '6px 12px', fontSize: '13px' }}
                  aria-label="Filter heatmap by visited page"
                >
                  {pagesBreakdown.map((p) => (
                    <option key={p.url} value={p.url}>
                      {p.url.replace(/https?:\/\/[^\/]+/, '') || '/'}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          <HeatmapCanvas clicks={sessionClicksForUrl} isLoading={isLoading} />
        </div>
      )}

      {/* TAB CONTENT: BREAKDOWN */}
      {activeTab === 'breakdown' && (
        <div className="card card-padding">
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600' }}>Visited Pages & Metrics</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Granular view of user interaction per page visit
            </p>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Page URL</th>
                  <th style={{ textAlign: 'center' }}>Views</th>
                  <th style={{ textAlign: 'center' }}>Clicks</th>
                  <th>Avg Viewport</th>
                  <th>Time Spent</th>
                </tr>
              </thead>
              <tbody>
                {pagesBreakdown.map((p) => (
                  <tr key={p.url}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Globe size={13} color="var(--secondary)" />
                        <code style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {p.url}
                        </code>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-cyan" style={{ minWidth: '24px', justifyContent: 'center' }}>
                        <Eye size={10} style={{ marginRight: '3px' }} /> {p.pageViews}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-amber" style={{ minWidth: '24px', justifyContent: 'center' }}>
                        <MousePointer size={10} style={{ marginRight: '3px' }} /> {p.clicks}
                      </span>
                    </td>
                    <td>
                      {p.viewportWidth && p.viewportHeight ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                          <Monitor size={12} color="var(--primary-light)" />
                          <span>{p.viewportWidth} × {p.viewportHeight}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-subtle)' }}>—</span>
                      )}
                    </td>
                    <td style={{ fontWeight: '500', color: 'var(--success)', fontSize: '13px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} />
                        <span>{formatDuration(p.estimatedTimeMs)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
