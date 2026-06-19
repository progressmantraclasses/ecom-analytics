import React from 'react';

function NoDataSVG() {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="icon">
      <rect x="20" y="20" width="160" height="120" rx="12" fill="rgba(99,102,241,0.06)" stroke="rgba(99,102,241,0.15)" strokeWidth="1.5" />
      <rect x="40" y="50" width="50" height="8" rx="4" fill="rgba(99,102,241,0.2)" />
      <rect x="40" y="66" width="80" height="6" rx="3" fill="rgba(255,255,255,0.08)" />
      <rect x="40" y="80" width="60" height="6" rx="3" fill="rgba(255,255,255,0.05)" />
      <circle cx="150" cy="60" r="24" fill="rgba(99,102,241,0.1)" stroke="rgba(99,102,241,0.2)" strokeWidth="1.5" strokeDasharray="4 3" />
      <path d="M142 52 L158 68 M158 52 L142 68" stroke="rgba(99,102,241,0.4)" strokeWidth="2" strokeLinecap="round" />
      <rect x="40" y="104" width="120" height="8" rx="4" fill="rgba(255,255,255,0.04)" />
    </svg>
  );
}

function NoSearchSVG() {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="icon">
      <circle cx="90" cy="72" r="40" fill="rgba(6,182,212,0.06)" stroke="rgba(6,182,212,0.2)" strokeWidth="1.5" />
      <circle cx="90" cy="72" r="26" fill="rgba(6,182,212,0.04)" stroke="rgba(6,182,212,0.15)" strokeWidth="1.5" strokeDasharray="4 3" />
      <path d="M122 104 L148 130" stroke="rgba(6,182,212,0.3)" strokeWidth="6" strokeLinecap="round" />
      <path d="M80 72 L100 72 M90 62 L90 82" stroke="rgba(6,182,212,0.4)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function NoHeatmapSVG() {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="icon">
      {[...Array(6)].map((_, i) =>
        [...Array(8)].map((_, j) => (
          <circle
            key={`${i}-${j}`}
            cx={24 + j * 22}
            cy={24 + i * 20}
            r={3 + Math.random() * 5}
            fill={`rgba(${99 + i * 20},${102},${241},${0.05 + Math.random() * 0.15})`}
          />
        ))
      )}
      <rect x="20" y="20" width="160" height="120" rx="8" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
    </svg>
  );
}

const variants = {
  noData: { svg: NoDataSVG, title: 'No data yet', message: 'Events will appear here once users start interacting with your tracked pages.' },
  noSessions: { svg: NoDataSVG, title: 'No sessions yet', message: 'Sessions will appear here once your tracking script starts collecting data.' },
  noResults: { svg: NoSearchSVG, title: 'No results found', message: 'Try adjusting your search or filter criteria.' },
  noHeatmap: { svg: NoHeatmapSVG, title: 'No click data', message: 'Select a page URL with tracked click events to render the heatmap.' },
};

export default function EmptyState({ variant = 'noData', title, message, action }) {
  const meta = variants[variant] ?? variants.noData;
  const SVG = meta.svg;

  return (
    <div className="empty-state">
      <SVG />
      <h3>{title ?? meta.title}</h3>
      <p>{message ?? meta.message}</p>
      {action && <div style={{ marginTop: '20px' }}>{action}</div>}
    </div>
  );
}
