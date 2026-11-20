import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import { RequirementRegistry } from '@civ-clone/core-requirement/RequirementRegistry';
import { WonderRegistry } from '@civ-clone/core-wonder/WonderRegistry';
import UnitYield from '@civ-clone/core-unit/Rules/Yield';
export declare const BEFORE_DAMAGE = 2500;
/** The moves each Wonder adds, read by its rule and by what it says it does (civ-clone/web-renderer#1196). */
export declare const lighthouseMoves: number, magellansMoves: number;
export declare const getRules: (
  wonderRegistry?: WonderRegistry,
  playerResearchRegistry?: PlayerResearchRegistry,
  requirementRegistry?: RequirementRegistry
) => UnitYield[];
export default getRules;
