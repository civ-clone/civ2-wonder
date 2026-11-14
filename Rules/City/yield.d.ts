import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import { RequirementRegistry } from '@civ-clone/core-requirement/RequirementRegistry';
import { WonderRegistry } from '@civ-clone/core-wonder/WonderRegistry';
import CityYield from '@civ-clone/core-city/Rules/Yield';
import { PendingEffectRegistry } from '@civ-clone/core-pending-effect';
import { PlayerGovernmentRegistry } from '@civ-clone/core-government/PlayerGovernmentRegistry';
import { TileImprovementRegistry } from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
export interface CityYieldRegistries {
  pendingEffects?: PendingEffectRegistry;
  playerGovernmentRegistry?: PlayerGovernmentRegistry;
  playerResearchRegistry?: PlayerResearchRegistry;
  requirementRegistry?: RequirementRegistry;
  tileImprovementRegistry?: TileImprovementRegistry;
  wonderRegistry?: WonderRegistry;
}
export declare const getRules: ({
  pendingEffects,
  playerGovernmentRegistry,
  playerResearchRegistry,
  requirementRegistry,
  tileImprovementRegistry,
  wonderRegistry,
}?: CityYieldRegistries) => CityYield[];
export default getRules;
