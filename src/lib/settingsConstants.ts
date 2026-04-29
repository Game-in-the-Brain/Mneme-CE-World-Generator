export type WeightOutcome = { label: string; descriptor: string; span: number };

export const WEALTH_OUTCOMES: WeightOutcome[] = [
  { label: 'Average',     descriptor: 'SOC +0', span: 7 }, // rolls 2-8
  { label: 'Better-off',  descriptor: 'SOC +1', span: 2 }, // rolls 9-10
  { label: 'Prosperous',  descriptor: 'SOC +2', span: 1 }, // roll 11
  { label: 'Affluent',    descriptor: 'SOC +3', span: 1 }, // roll 12
];

export const DEV_OUTCOMES: WeightOutcome[] = [
  { label: 'UnderDeveloped', descriptor: 'HDI 0.0–0.59', span: 6 }, // rolls 2-7
  { label: 'Developing',     descriptor: 'HDI 0.60–0.69', span: 1 }, // roll 8
  { label: 'Mature',         descriptor: 'HDI 0.70–0.79', span: 1 }, // roll 9
  { label: 'Developed',      descriptor: 'HDI 0.80–0.89', span: 1 }, // roll 10
  { label: 'Well Developed', descriptor: 'HDI 0.90–0.94', span: 1 }, // roll 11
  { label: 'Very Developed', descriptor: 'HDI >0.95', span: 1 },     // roll 12
];

export const POWER_OUTCOMES: WeightOutcome[] = [
  { label: 'Anarchy',       descriptor: '≤7', span: 6 },  // rolls 2-7
  { label: 'Confederation', descriptor: '8–9', span: 2 }, // rolls 8-9
  { label: 'Federation',    descriptor: '10–11', span: 2 }, // rolls 10-11
  { label: 'Unitary State', descriptor: '12', span: 1 },  // roll 12
];

export const GOV_OUTCOMES: WeightOutcome[] = [
  { label: 'Aristocracy', descriptor: '2–5', span: 4 },  // rolls 2-5
  { label: 'Ideocracy',   descriptor: '6–7', span: 2 },  // rolls 6-7
  { label: 'Kratocracy',  descriptor: '8–9', span: 2 },  // rolls 8-9
  { label: 'Democracy',   descriptor: '10–11', span: 2 }, // rolls 10-11
  { label: 'Meritocracy', descriptor: '12', span: 1 },   // roll 12
];

export function diceToOutcomeWeights(dice: number[], outcomes: WeightOutcome[]): number[] {
  const weights: number[] = [];
  let idx = 0;
  for (const outcome of outcomes) {
    let sum = 0;
    for (let i = 0; i < outcome.span; i++) {
      sum += dice[idx + i] ?? 0;
    }
    weights.push(sum);
    idx += outcome.span;
  }
  return weights;
}

export function outcomeWeightsToDice(weights: number[], outcomes: WeightOutcome[]): number[] {
  const dice: number[] = [];
  for (let i = 0; i < weights.length; i++) {
    const span = outcomes[i].span;
    const perIndex = span > 0 ? weights[i] / span : 0;
    for (let j = 0; j < span; j++) {
      dice.push(perIndex);
    }
  }
  return dice;
}

export const CURVE_LABELS: Record<string, string> = {
  mneme:  'Mneme — compounding growth',
  flat:   'Flat — same income at every TL',
  linear: 'Linear — fixed % per TL step',
  custom: 'Custom — user-defined values',
};
