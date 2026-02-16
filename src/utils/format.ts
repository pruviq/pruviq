/** Shared formatting utilities used across PRUVIQ components */

export function formatPrice(p: number): string {
  if (p >= 10000) return p.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (p >= 100) return p.toLocaleString('en-US', { maximumFractionDigits: 2 });
  if (p >= 1) return p.toLocaleString('en-US', { maximumFractionDigits: 3 });
  if (p >= 0.01) return p.toFixed(4);
  return p.toLocaleString('en-US', { maximumFractionDigits: 6 });
}

export function formatVolume(v: number): string {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

export function changeColor(v: number): string {
  return v >= 0 ? '#16c784' : '#ea3943';
}

export function fgColor(idx: number): string {
  if (idx <= 25) return '#ea3943';
  if (idx <= 45) return '#ea8c00';
  if (idx <= 55) return '#c8c8c8';
  if (idx <= 75) return '#93d900';
  return '#16c784';
}

export function timeAgo(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const now = Date.now();
    const diff = Math.floor((now - d.getTime()) / 60000);
    if (diff < 1) return 'now';
    if (diff < 60) return `${diff}m`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h`;
    return `${Math.floor(diff / 1440)}d`;
  } catch {
    return '';
  }
}
