import { formatDistanceToNow, format } from 'date-fns';

export const formatRelativeTime = (date) => {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return 'Unknown';
  }
};

export const formatAbsoluteTime = (date) => {
  try {
    return format(new Date(date), 'MMM d, yyyy HH:mm:ss');
  } catch {
    return 'Unknown';
  }
};

export const formatDate = (date) => {
  try {
    return format(new Date(date), 'MMM d, yyyy');
  } catch {
    return 'Unknown';
  }
};

export const truncateId = (id, chars = 8) => {
  if (!id) return '—';
  return id.substring(0, chars) + '...';
};

export const truncateUrl = (url, maxLen = 50) => {
  if (!url) return '—';
  const clean = url.replace(/^https?:\/\//, '');
  return clean.length > maxLen ? clean.substring(0, maxLen) + '...' : clean;
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

export const formatNumber = (n) => {
  if (n === undefined || n === null) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

export const getSessionDuration = (firstSeen, lastSeen) => {
  try {
    const diffMs = new Date(lastSeen) - new Date(firstSeen);
    if (diffMs < 60000) return `${Math.round(diffMs / 1000)}s`;
    if (diffMs < 3600000) return `${Math.round(diffMs / 60000)}m`;
    return `${(diffMs / 3600000).toFixed(1)}h`;
  } catch {
    return '—';
  }
};

export const getQuadrant = (x, y, w, h) => {
  const nx = x / w;
  const ny = y / h;
  if (nx < 0.5 && ny < 0.5) return 'Top Left';
  if (nx >= 0.5 && ny < 0.5) return 'Top Right';
  if (nx < 0.5 && ny >= 0.5) return 'Bottom Left';
  return 'Bottom Right';
};
