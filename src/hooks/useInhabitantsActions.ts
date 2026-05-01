import type { StarSystem, ShipsInAreaResult } from '../types';
import { generateShipsInTheArea } from '../lib/shipsInArea';

export function useInhabitantsActions(
  system: StarSystem,
  onUpdateSystem?: (system: StarSystem) => void,
  setShipsResult?: (result: ShipsInAreaResult | null) => void,
) {
  function handleRollWeekly() {
    if (!onUpdateSystem) return;
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const d3 = Math.floor(Math.random() * 6) + 1;
    const total = d1 + d2 + d3;
    const weeklyActivity = system.inhabitants.starport.weeklyBase * total;
    const updated: StarSystem = {
      ...system,
      inhabitants: {
        ...system.inhabitants,
        starport: {
          ...system.inhabitants.starport,
          weeklyRoll: total,
          weeklyActivity,
        },
      },
    };
    onUpdateSystem(updated);
  }

  function handleGenerateShips() {
    if (!setShipsResult) return;
    if (system.inhabitants.starport.class === 'X' && !system.allowShipsAtXPort) {
      setShipsResult({
        budget: 0, distributionRoll: 0, smallCraftBudget: 0,
        civilianBudget: 0, warshipBudget: 0, ships: [],
      });
      return;
    }
    const totalBodies =
      (system.circumstellarDisks?.length ?? 0) +
      (system.dwarfPlanets?.length ?? 0) +
      (system.terrestrialWorlds?.length ?? 0) +
      (system.iceWorlds?.length ?? 0) +
      (system.gasWorlds?.length ?? 0) +
      (system.mainWorld ? 1 : 0);
    const result = generateShipsInTheArea(
      system.inhabitants.starport.weeklyActivity,
      totalBodies,
      system.inhabitants.techLevel,
      system.economicPreset,
      system.inhabitants.tradeMultiplier,
    );
    setShipsResult(result);
  }

  return { handleRollWeekly, handleGenerateShips };
}
