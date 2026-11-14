import {
  CityImprovementRegistry,
  instance as cityImprovementRegistryInstance,
} from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import {
  IWonderStatus,
  wonderHistory as baseWonderHistory,
} from '@civ-clone/base-wonder/lib/wonderHistory';
import {
  WonderRegistry,
  instance as wonderRegistryInstance,
} from '@civ-clone/core-wonder/WonderRegistry';
import { wonderTypes } from './wonderTable';

export {
  IWonderStatus,
  WonderState,
  everBuilt,
  wonderStatus,
} from '@civ-clone/base-wonder/lib/wonderHistory';

/** Civ2's Wonders in the order of its Wonders of the World report: RULES.TXT's (`wonderTypes`). */
export const WONDERS_IN_ORIGINAL_ORDER = wonderTypes;

/** Every Wonder ever built, standing or lost, in RULES.TXT's order (base-wonder's `wonderHistory`). */
export const wonderHistory = (
  wonderRegistry: WonderRegistry = wonderRegistryInstance,
  cityImprovementRegistry: CityImprovementRegistry = cityImprovementRegistryInstance
): IWonderStatus[] =>
  baseWonderHistory(wonderTypes, wonderRegistry, cityImprovementRegistry);

export default wonderHistory;
