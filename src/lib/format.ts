// =====================
// Number Formatting — QA-004
// =====================

/**
 * Format a number with comma separators.
 * Large numbers get comma-separated integer formatting.
 * Small numbers keep significant figures.
 */
export function formatNumber(value: number): string {
  if (!isFinite(value)) return '—';
  const abs = Math.abs(value);
  if (abs === 0) return '0';
  if (abs >= 1) {
    return new Intl.NumberFormat('en-US').format(Math.round(value));
  }
  if (abs >= 0.001) {
    return new Intl.NumberFormat('en-US', {
      minimumSignificantDigits: 1,
      maximumSignificantDigits: 4,
    }).format(value);
  }
  // Very small — scientific notation is acceptable
  return value.toExponential(2);
}

/**
 * Format a number with its unit of measure, no scientific notation.
 */
export function formatValue(value: number, unit: string): string {
  return `${formatNumber(value)} ${unit}`;
}

/**
 * Format a large integer population figure.
 */
export function formatPopulation(value: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(value));
}

/**
 * Format a luminosity value. Values ≥ 1000 get comma formatting.
 * Values < 0.01 use 3 significant figures.
 */
export function formatLuminosity(value: number): string {
  if (!isFinite(value)) return '—';
  if (value >= 1000) {
    return new Intl.NumberFormat('en-US').format(Math.round(value));
  }
  if (value >= 0.01) {
    return parseFloat(value.toPrecision(4)).toString();
  }
  return value.toExponential(2);
}

/** Format a large credit value with scale abbreviations (K/M/B/T/Qa/Qi/Sx). */
export function formatCreditScale(value: number): string {
  if (!isFinite(value) || value === 0) return '0 Cr';
  const abs = Math.abs(value);
  const tiers: [number, string][] = [
    [1e21, 'Sx'], [1e18, 'Qi'], [1e15, 'Qa'], [1e12, 'T'],
    [1e9, 'B'], [1e6, 'M'], [1e3, 'K'],
  ];
  for (const [threshold, suffix] of tiers) {
    if (abs >= threshold) {
      const scaled = value / threshold;
      const formatted = scaled >= 100
        ? Math.round(scaled).toLocaleString('en-US')
        : parseFloat(scaled.toPrecision(3)).toString();
      return `${formatted} ${suffix} Cr`;
    }
  }
  return `${new Intl.NumberFormat('en-US').format(Math.round(value))} Cr`;
}

/**
 * Format a Credits/week value with scale abbreviations and /week unit.
 */
export function formatCredits(value: number): string {
  return `${formatCreditScale(value)}/week`;
}

/**
 * Format an annual trade volume with scale abbreviations and /year unit.
 */
export function formatAnnualTrade(value: number): string {
  return `${formatCreditScale(value)}/year`;
}
