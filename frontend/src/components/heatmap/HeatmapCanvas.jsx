import React, { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { getQuadrant } from '../../lib/utils';

function drawHeatmap(canvas, clicks) {
  if (!canvas || !clicks?.length) return;

  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  ctx.clearRect(0, 0, W, H);

  // Draw background
  ctx.fillStyle = 'rgba(10, 15, 30, 0.95)';
  ctx.fillRect(0, 0, W, H);

  // Draw grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += W / 12) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += H / 8) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // Count density by region
  const density = {};
  clicks.forEach((c) => {
    const vw = c.viewport_width || 1440;
    const vh = c.viewport_height || 900;
    const nx = (c.x / vw) * W;
    const ny = (c.y / vh) * H;
    const key = `${Math.round(nx / 30)}_${Math.round(ny / 30)}`;
    density[key] = (density[key] || 0) + 1;
  });

  const maxDensity = Math.max(...Object.values(density), 1);

  // Draw heat points
  clicks.forEach((c) => {
    const vw = c.viewport_width || 1440;
    const vh = c.viewport_height || 900;
    const x = (c.x / vw) * W;
    const y = (c.y / vh) * H;
    const key = `${Math.round(x / 30)}_${Math.round(y / 30)}`;
    const d = (density[key] || 1) / maxDensity;

    const radius = 20 + d * 20;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);

    // Color scale: blue → cyan → indigo → red based on density
    const r = Math.round(6 + d * 230);
    const g = Math.round(182 - d * 150);
    const b = Math.round(212 - d * 100);

    gradient.addColorStop(0, `rgba(${r},${g},${b},${0.8 * d + 0.2})`);
    gradient.addColorStop(0.5, `rgba(${r},${g},${b},${0.3 * d})`);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.globalCompositeOperation = 'lighter';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
  });

  ctx.globalCompositeOperation = 'source-over';

  // Draw a subtle vignette overlay
  const vignette = ctx.createRadialGradient(W/2, H/2, H*0.3, W/2, H/2, H*0.8);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(10,15,30,0.5)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
}

export default function HeatmapCanvas({ clicks, isLoading }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && !isLoading) {
      drawHeatmap(canvasRef.current, clicks);
    }
  }, [clicks, isLoading]);

  // Compute dominant quadrant
  let topQuadrant = '—';
  if (clicks?.length) {
    const counts = {};
    clicks.forEach((c) => {
      const q = getQuadrant(c.x, c.y, c.viewport_width || 1440, c.viewport_height || 900);
      counts[q] = (counts[q] || 0) + 1;
    });
    topQuadrant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';
  }

  return (
    <div>
      <div className="heatmap-wrapper">
        <canvas
          ref={canvasRef}
          width={1200}
          height={700}
          className="heatmap-canvas"
          aria-label="Click heatmap visualization"
          style={{ borderRadius: '12px' }}
        />
        {isLoading && (
          <div className="heatmap-overlay">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <Loader2 size={28} color="var(--primary-light)" style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading heatmap data...</span>
            </div>
          </div>
        )}
        {!isLoading && !clicks?.length && (
          <div className="heatmap-overlay">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔥</div>
              <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>No click data</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Select a page URL above to view the heatmap
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Color Scale Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Density scale:</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '80px', height: '8px', borderRadius: '4px', background: 'linear-gradient(to right, #06B6D4, #6366F1, #EF4444)' }} />
          <span style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>Low → High</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary-light)' }}>{clicks?.length ?? 0}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Clicks</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--secondary)' }}>{topQuadrant}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Most Active Area</div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
