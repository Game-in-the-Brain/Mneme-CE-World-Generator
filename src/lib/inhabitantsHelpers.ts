import type { WealthLevel, DevelopmentLevel } from '../types';

/**
 * QA-069: Narrative coherence notes for Wealth + Development combinations.
 * Wealth = material resources / economic output (what the world HAS).
 * Development = equity / institutional quality / HDI (how well the population lives).
 * A world can be resource-rich but underdeveloped (Ghana, Equatorial Guinea)
 * or developed but resource-poor (Singapore, post-industrial Rust Belt).
 */
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

  // Large gaps (existing logic)
  if (gap >= 2) {
    return 'This world has the infrastructure and education of a much more developed society, but the returns are captured elsewhere. High-output resource extraction, corporate enclaves, or off-world tithes keep local living standards low despite advanced capabilities.';
  }
  if (gap <= -2) {
    return 'Resources without institutional depth. Value flows in from extraction, foreign investment, or remittances, but local governance and infrastructure lag behind. The economy is rich but brittle — a resource-curse economy.';
  }

  // Close-rank contradictions (QA-069)
  if (wealth === 'Average' && development === 'UnderDeveloped') {
    return 'A resource-scarce, underdeveloped world. The population scrapes by on subsistence farming or marginal extraction. Little surplus exists to invest in infrastructure or education. (Like Haiti or rural Malawi.)';
  }
  if (wealth === 'Better-off' && development === 'UnderDeveloped') {
    return 'A resource-rich world with a poor population. The land or mines produce significant value, but it is captured by off-world corporations, a narrow elite, or colonial powers. The people see little benefit. (Like Equatorial Guinea or the DRC.)';
  }
  if (wealth === 'Average' && development === 'Developing') {
    return 'Industrialising but struggling. Basic production exists but surpluses are thin. Investment in infrastructure is ongoing, but most of the population still lives close to subsistence. (Like Bangladesh or Vietnam in the 1990s.)';
  }
  if (wealth === 'Prosperous' && development === 'Developing') {
    return 'A booming resource or export economy outpacing its institutions. New money flows in faster than schools, hospitals, and governance can keep up. Corruption and inequality are common side-effects. (Like China or Brazil during rapid growth.)';
  }
  if (wealth === 'Affluent' && development === 'Mature') {
    return 'Extreme resource wealth in a mature but not cutting-edge economy. Old money, established industries, possibly resource-dependent. The population lives well, but diversification is limited. (Like Qatar, Kuwait, or Nauru at its peak.)';
  }
  if (wealth === 'Prosperous' && development === 'Developed') {
    return 'A developed society with moderate resources. Strong institutions and education produce steady prosperity without extreme riches. Comfortable, stable, and broadly equitable. (Like Spain, Italy, or South Korea.)';
  }

  return null;
}
