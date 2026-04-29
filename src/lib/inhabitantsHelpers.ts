import type { WealthLevel, DevelopmentLevel } from '../types';

export function getWealthDevelopmentContext(wealth: WealthLevel, development: DevelopmentLevel): string | null {
  const wealthRanks: Record<WealthLevel, number> = {
    'Average': 0, 'Better-off': 1, 'Prosperous': 2, 'Affluent': 3,
  };
  const devRanks: Record<DevelopmentLevel, number> = {
    'UnderDeveloped': 0, 'Developing': 1, 'Mature': 2, 'Developed': 3, 'Well Developed': 4, 'Very Developed': 5,
  };
  const w = wealthRanks[wealth];
  const d = devRanks[development];
  const gap = d - w;

  if (gap >= 2) {
    return 'This world has the infrastructure and education of a much richer society, but the returns are captured elsewhere. High-output resource extraction, corporate enclaves, or off-world tithes keep local wealth low despite advanced capabilities.';
  }
  if (gap <= -2) {
    return 'Prosperity without institutional depth. Money flows in from resource extraction, foreign investment, or remittances, but local governance and infrastructure lag behind. The economy is rich but brittle.';
  }
  return null;
}
