import {
  preloadLcIndex, preloadLc, preloadLcDistanceTable, preloadDriftRules,
} from '@gi7b/namegen';
import { preloadPlaceDescriptors } from '@gi7b/placegen';
import {
  NPF_LC_INDEX, NPF_LC_DISTANCE, NPF_NAMEGEN_LCS,
  NPF_DRIFT_RULES, NPF_PLACE_DESCRIPTORS,
} from './npf-data.generated';

let loaded = false;

export function preloadNpfData(): void {
  if (loaded) return;
  loaded = true;
  preloadLcIndex((NPF_LC_INDEX as any).lcs);
  preloadLcDistanceTable((NPF_LC_DISTANCE as any).distances);
  for (const [id, lc] of Object.entries(NPF_NAMEGEN_LCS)) {
    preloadLc(id, lc as any);
  }
  for (const [id, rules] of Object.entries(NPF_DRIFT_RULES)) {
    preloadDriftRules(id, rules as any);
  }
  preloadPlaceDescriptors(NPF_PLACE_DESCRIPTORS as any);
}
