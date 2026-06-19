import React from 'react';

export function SkeletonText({ width = '100%', height = '14px', className = '' }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height }}
      role="status"
      aria-label="Loading..."
    />
  );
}

export function SkeletonStatCard() {
  return (
    <div className="card stat-card" style={{ padding: '24px' }}>
      <SkeletonText width="44px" height="44px" className="" style={{ borderRadius: '12px', marginBottom: '16px' }} />
      <div className="skeleton" style={{ width: '44px', height: '44px', borderRadius: '12px', marginBottom: '16px' }} />
      <div className="skeleton" style={{ width: '80px', height: '32px', marginBottom: '8px' }} />
      <div className="skeleton" style={{ width: '120px', height: '14px' }} />
    </div>
  );
}

export function SkeletonRow({ cols = 5 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: '14px 16px' }}>
          <div className="skeleton" style={{ height: '14px', width: `${60 + Math.random() * 40}%` }} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonTable({ rows = 8, cols = 6 }) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} cols={cols} />
      ))}
    </tbody>
  );
}

export function SkeletonTimelineItem() {
  return (
    <div className="timeline-item" style={{ animationDelay: '0ms' }}>
      <div className="timeline-dot" style={{ background: 'rgba(255,255,255,0.1)' }} />
      <div className="timeline-card">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
          <div className="skeleton" style={{ width: '80px', height: '22px', borderRadius: '20px' }} />
          <div className="skeleton" style={{ width: '120px', height: '22px', borderRadius: '20px' }} />
        </div>
        <div className="skeleton" style={{ height: '13px', width: '70%', marginBottom: '6px' }} />
        <div className="skeleton" style={{ height: '11px', width: '40%' }} />
      </div>
    </div>
  );
}
