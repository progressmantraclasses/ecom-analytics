import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Globe, MousePointer, Clock, Activity } from 'lucide-react';
import EventTimeline from '../components/sessions/EventTimeline';
import { useSessionDetail } from '../hooks/useSessions';
import { formatAbsoluteTime, getSessionDuration, copyToClipboard } from '../lib/utils';

export default function SessionDetail() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const { data, isLoading, error } = useSessionDetail(sessionId);

  const handleCopy = async () => {
    const ok = await copyToClipboard(sessionId);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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

  const session = data?.session;
  const events = data?.events ?? [];

  // Compute stats
  const uniquePages = new Set(events.map((e) => e.page_url)).size;
  const duration = session ? getSessionDuration(session.first_seen, session.last_seen) : '—';

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

      {/* TIMELINE */}
      <div className="card card-padding">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600' }}>User Journey</h2>
          <span className="badge badge-cyan">{events.length} events</span>
        </div>
        <EventTimeline events={events} isLoading={isLoading} />
      </div>
    </div>
  );
}
