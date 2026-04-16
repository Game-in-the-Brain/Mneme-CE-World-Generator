import type { ShipInArea, ShipsInAreaResult, ShipLocation, TLProductivityPreset } from '../types';
import shipReference from '../../mneme_ship_reference.json';


interface ShipRef {
  name: string;
  tl: number;
  dt: number;
  total_cost_cr: number;
  supplies_cr: number;
  category: string;
  monthly_operating_cost_cr: number;
  visiting_cost_cr: number;
  traffic_pool: 'small' | 'civilian' | 'warship';
  minTL: number;
}

/** QA-059: Jump-capable ships require MTL 12+; everything else is intra-system (MTL 9) */
const JUMP_SHIPS = new Set<string>([
  'Courier Ship',
  'Yacht',
  'Merchant Trader',
  'Merchant Liner',
  'Frontier Trader',
  'Merchant Freighter',
  "'Bosco' Merchant Freighter",
  'Patrol Frigate',
  'Corvette',
  'Exploration Vessel',
  'Missile Frigate',
  'Escort Frigate',
  'Raider',
  'Passenger Ship',
  'Passenger Liner (400DT)',
  'Frontier Passenger',
  'Passenger Liner (1000DT)',
  'Research Vessel',
  'Survey Vessel',
]);

const SHIPS: ShipRef[] = (shipReference.ships as Omit<ShipRef, 'minTL'>[]).map(s => ({
  ...s,
  minTL: JUMP_SHIPS.has(s.name) ? 12 : 9,
}));

/** 1D6 × 10% distribution table for Small/Civilian/Warship budget split */
const DISTRIBUTION_TABLE: Record<number, { small: number; civilian: number; warship: number }> = {
  1: { small: 1 / 3, civilian: 1 / 3, warship: 1 / 3 },
  2: { small: 0.50, civilian: 0.40, warship: 0.10 },
  3: { small: 0.40, civilian: 0.50, warship: 0.10 },
  4: { small: 0.60, civilian: 0.30, warship: 0.10 },
  5: { small: 0.45, civilian: 0.45, warship: 0.10 },
  6: { small: 0.50, civilian: 0.30, warship: 0.20 },
};

function rollD6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

function rollLocationWithPosition(totalBodies: number): { location: ShipLocation; systemPosition?: number } {
  const r = rollD6();
  if (r <= 2) return { location: 'Orbit' };
  if (r <= 4) {
    // QA-024: "In System" ships need a body index 1–N
    if (totalBodies === 0) return { location: 'Orbit' };
    const pos = Math.ceil(Math.random() * totalBodies);
    return { location: 'System', systemPosition: pos };
  }
  return { location: 'Docked' };
}

function pickRandomShip(pool: ShipRef[]): ShipRef {
  return pool[Math.floor(Math.random() * pool.length)];
}

function generatePoolShips(pool: ShipRef[], budget: number, totalBodies: number): ShipInArea[] {
  const result: ShipInArea[] = [];
  if (pool.length === 0 || budget <= 0) return result;

  const minCost = Math.min(...pool.map(s => s.visiting_cost_cr));
  let remaining = budget;
  let safety = 0;

  while (remaining >= minCost && safety < 1000) {
    safety++;
    const ship = pickRandomShip(pool);
    if (ship.visiting_cost_cr <= remaining) {
      remaining -= ship.visiting_cost_cr;
      const { location, systemPosition } = rollLocationWithPosition(totalBodies);
      result.push({
        name: ship.name,
        dt: ship.dt,
        monthlyOperatingCost: ship.monthly_operating_cost_cr,
        purchasePrice: ship.total_cost_cr,
        visitingCost: ship.visiting_cost_cr,
        location,
        systemPosition,
        trafficPool: ship.traffic_pool,
      });
    }
    // If random pick is too expensive, loop continues; safety cap prevents infinite loop
  }

  return result;
}

export function generateShipsInTheArea(
  weeklyTradeValue: number,
  totalBodies: number,
  worldTL: number,
  _preset?: TLProductivityPreset
): ShipsInAreaResult {
  // Step 0: QA-059 — TL gate. Filter pool to ships buildable/servicable at this world's TL
  const availableShips = SHIPS.filter(s => s.minTL <= worldTL);
  const availablePool: Record<'small' | 'civilian' | 'warship', ShipRef[]> = {
    small: availableShips.filter(s => s.traffic_pool === 'small'),
    civilian: availableShips.filter(s => s.traffic_pool === 'civilian'),
    warship: availableShips.filter(s => s.traffic_pool === 'warship'),
  };

  // Step 1: Ships Budget = Weekly Trade Value × (1D6 × 10%)
  const budgetRoll = rollD6();
  const rawBudget = weeklyTradeValue * (budgetRoll * 0.1);

  // QA-058: removed scarcity multiplier — let lower CE trade value drive scarcity naturally
  const budget = rawBudget;

  // Step 2: Category distribution
  const distRoll = rollD6();
  const dist = DISTRIBUTION_TABLE[distRoll] ?? DISTRIBUTION_TABLE[2];

  const smallCraftBudget = budget * dist.small;
  const civilianBudget = budget * dist.civilian;
  const warshipBudget = budget * dist.warship;

  // Step 4: Generation loop per pool (QA-024: pass totalBodies for In System position roll)
  const smallShips = generatePoolShips(availablePool.small, smallCraftBudget, totalBodies);
  const civilianShips = generatePoolShips(availablePool.civilian, civilianBudget, totalBodies);
  const warshipShips = generatePoolShips(availablePool.warship, warshipBudget, totalBodies);

  return {
    budget,
    distributionRoll: distRoll,
    smallCraftBudget,
    civilianBudget,
    warshipBudget,
    ships: [...smallShips, ...civilianShips, ...warshipShips],
  };
}
