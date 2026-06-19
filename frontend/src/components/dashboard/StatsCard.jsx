import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp } from 'lucide-react';

function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    startRef.current = null;

    const animate = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return value;
}

export default function StatsCard({ label, value, icon: Icon, colorClass, trend }) {
  const animatedValue = useCountUp(value ?? 0);

  const formatValue = (n) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toLocaleString();
  };

  return (
    <div className={`card stat-card ${colorClass}`}>
      <div className={`stat-icon ${colorClass}`}>
        <Icon size={20} />
      </div>
      <div className="stat-value">{formatValue(animatedValue)}</div>
      <div className="stat-label">{label}</div>
      {trend !== undefined && (
        <div className={`stat-trend ${trend >= 0 ? 'trend-up' : 'trend-neutral'}`}>
          <TrendingUp size={10} />
          {trend >= 0 ? '+' : ''}{trend}% vs last week
        </div>
      )}
    </div>
  );
}
