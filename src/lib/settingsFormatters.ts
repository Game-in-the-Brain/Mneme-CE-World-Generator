export function formatPopulation(pop: number): string {
  if (pop >= 1_000_000_000) return `${(pop / 1_000_000_000).toFixed(1)}B`;
  if (pop >= 1_000_000)     return `${(pop / 1_000_000).toFixed(1)}M`;
  if (pop >= 1_000)         return `${(pop / 1_000).toFixed(1)}K`;
  return pop.toString();
}

export function formatNumber(value: number): string {
  if (!isFinite(value)) return '—';
  return new Intl.NumberFormat('en-US').format(Math.round(value));
}

export function formatCreditCompact(value: number): string {
  if (!isFinite(value) || value === 0) return '0 Cr';
  const abs = Math.abs(value);
  if (abs >= 1e12) return `${(value / 1e12).toFixed(2)} T Cr`;
  if (abs >= 1e9)  return `${(value / 1e9).toFixed(2)} B Cr`;
  if (abs >= 1e6)  return `${(value / 1e6).toFixed(2)} M Cr`;
  if (abs >= 1e3)  return `${(value / 1e3).toFixed(2)} K Cr`;
  return `${formatNumber(value)} Cr`;
}
