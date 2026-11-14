import { CityImprovementRegistry } from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import { IWonderStatus } from '@civ-clone/base-wonder/lib/wonderHistory';
import { WonderRegistry } from '@civ-clone/core-wonder/WonderRegistry';
export {
  IWonderStatus,
  WonderState,
  everBuilt,
  wonderStatus,
} from '@civ-clone/base-wonder/lib/wonderHistory';
/** Civ2's Wonders in the order of its Wonders of the World report: RULES.TXT's (`wonderTypes`). */
export declare const WONDERS_IN_ORIGINAL_ORDER: typeof import('@civ-clone/core-wonder/Wonder').Wonder[];
/** Every Wonder ever built, standing or lost, in RULES.TXT's order (base-wonder's `wonderHistory`). */
export declare const wonderHistory: (
  wonderRegistry?: WonderRegistry,
  cityImprovementRegistry?: CityImprovementRegistry
) => IWonderStatus[];
export default wonderHistory;
