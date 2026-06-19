import React, { useState } from 'react';
import { Flame, ChevronDown, Calendar } from 'lucide-react';
import HeatmapCanvas from '../components/heatmap/HeatmapCanvas';
import { useHeatmapUrls, useHeatmap } from '../hooks/useHeatmap';
import EmptyState from '../components/shared/EmptyState';

export default function Heatmap() {
  const [selectedUrl, setSelectedUrl] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const { data: urlsData, isLoading: urlsLoading } = useHeatmapUrls();
  const urls = urlsData?.urls ?? [];

  const heatmapParams = selectedUrl
    ? { page_url: selectedUrl, ...(from && { from }), ...(to && { to }) }
    : null;

  const { data: heatmapData, isLoading: heatmapLoading } = useHeatmap(heatmapParams);
  const clicks = heatmapData?.clicks ?? [];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Click Heatmap</h1>
        <p className="page-sub">Visualize where users click on your pages</p>
      </div>

      {/* CONTROLS */}
      <div className="card card-padding" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '12px', alignItems: 'end', flexWrap: 'wrap' }}>
          {/* URL Selector */}
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Page URL
            </label>
            <div style={{ position: 'relative' }}>
              <select
                className="input select"
                value={selectedUrl}
                onChange={(e) => setSelectedUrl(e.target.value)}
                disabled={urlsLoading}
                aria-label="Select page URL for heatmap"
              >
                <option value="">
                  {urlsLoading ? 'Loading URLs...' : urls.length === 0 ? 'No URLs available' : 'Select a page URL...'}
                </option>
                {urls.map((url) => (
                  <option key={url} value={url}>{url}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date From */}
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              <Calendar size={11} style={{ marginRight: '4px' }} />
              From
            </label>
            <input
              type="datetime-local"
              className="input"
              value={from}
              onChange={(e) => setFrom(e.target.value ? new Date(e.target.value).toISOString() : '')}
              style={{ width: '200px' }}
              aria-label="Filter from date"
            />
          </div>

          {/* Date To */}
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              <Calendar size={11} style={{ marginRight: '4px' }} />
              To
            </label>
            <input
              type="datetime-local"
              className="input"
              value={to}
              onChange={(e) => setTo(e.target.value ? new Date(e.target.value).toISOString() : '')}
              style={{ width: '200px' }}
              aria-label="Filter to date"
            />
          </div>

          {/* Clear filters */}
          <button
            className="btn btn-ghost"
            onClick={() => { setSelectedUrl(''); setFrom(''); setTo(''); }}
            style={{ height: '42px' }}
          >
            Clear
          </button>
        </div>

        {selectedUrl && (
          <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
            Showing <span style={{ color: 'var(--primary-light)', fontWeight: '600' }}>{clicks.length}</span> clicks for{' '}
            <code style={{ fontSize: '11px', color: 'var(--secondary)' }}>{selectedUrl}</code>
          </div>
        )}
      </div>

      {/* HEATMAP */}
      {!selectedUrl && urls.length === 0 && !urlsLoading ? (
        <div className="card">
          <EmptyState variant="noHeatmap" />
        </div>
      ) : (
        <div className="card card-padding">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Flame size={18} color="var(--warning)" />
            <h2 style={{ fontSize: '16px', fontWeight: '600' }}>Click Distribution</h2>
            {clicks.length > 0 && (
              <span className="badge badge-amber">{clicks.length} clicks</span>
            )}
          </div>
          <HeatmapCanvas clicks={clicks} isLoading={heatmapLoading} />
        </div>
      )}
    </div>
  );
}
