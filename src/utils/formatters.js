export function formatNumber(n, decimals = 2) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return Number(n).toLocaleString('en-GB', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatInteger(n) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return Number(n).toLocaleString('en-GB', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function formatCurrency(n, currency = 'GBP') {
  if (n === null || n === undefined || isNaN(n)) return '—';
  const symbols = { GBP: '£', USD: '$', EUR: '€' };
  const sym = symbols[currency] || '£';
  return `${sym}${Number(n).toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatUnit(value, unit, type) {
  if (value === null || value === undefined || isNaN(value)) return '—';
  const v = formatNumber(value);
  if (type === 'area') return unit === 'imperial' ? `${v} ft²` : `${v} m²`;
  if (type === 'volume') return unit === 'imperial' ? `${v} ft³` : `${v} m³`;
  if (type === 'length') return unit === 'imperial' ? `${v} ft` : `${v} m`;
  if (type === 'weight') return `${v} kg`;
  return `${v}`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatRelativeDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatDate(dateStr);
}
