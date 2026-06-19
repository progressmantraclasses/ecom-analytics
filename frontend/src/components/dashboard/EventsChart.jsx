import React from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { format, parseISO, subDays } from 'date-fns';

function fillMissingDays(data, days = 7) {
  const map = {};
  (data ?? []).forEach((d) => { map[d._id] = d.count; });

  return Array.from({ length: days }, (_, i) => {
    const date = format(subDays(new Date(), days - 1 - i), 'yyyy-MM-dd');
    return { date, events: map[date] ?? 0 };
  });
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(17,24,39,0.95)',
      border: '1px solid rgba(99,102,241,0.3)',
      borderRadius: '10px',
      padding: '12px 16px',
      backdropFilter: 'blur(12px)',
    }}>
      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
        {label && format(parseISO(label), 'MMM d, yyyy')}
      </p>
      <p style={{ fontSize: '16px', fontWeight: '700', color: '#818CF8' }}>
        {payload[0]?.value?.toLocaleString()} events
      </p>
    </div>
  );
};

export default function EventsChart({ data, isLoading }) {
  const chartData = fillMissingDays(data);

  if (isLoading) {
    return (
      <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="skeleton" style={{ width: '100%', height: '200px', borderRadius: '8px' }} />
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="eventsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(d) => format(parseISO(d), 'MMM d')}
          tick={{ fontSize: 11, fill: 'var(--text-subtle)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--text-subtle)' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}K` : v}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(99,102,241,0.3)', strokeWidth: 1 }} />
        <Area
          type="monotone"
          dataKey="events"
          stroke="#6366F1"
          strokeWidth={2.5}
          fill="url(#eventsGradient)"
          dot={{ fill: '#6366F1', r: 4, strokeWidth: 2, stroke: '#0A0F1E' }}
          activeDot={{ r: 6, fill: '#818CF8' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
