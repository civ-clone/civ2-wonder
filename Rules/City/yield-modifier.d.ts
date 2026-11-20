import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import { RequirementRegistry } from '@civ-clone/core-requirement/RequirementRegistry';
import { WonderRegistry } from '@civ-clone/core-wonder/WonderRegistry';
import YieldModifier from '@civ-clone/core-city/Rules/YieldModifier';
export interface YieldModifierRegistries {
  playerResearchRegistry?: PlayerResearchRegistry;
  requirementRegistry?: RequirementRegistry;
  wonderRegistry?: WonderRegistry;
}
/** The share of its city's science the Copernicus Observatory adds, of the total so far: all of it again. */
export declare const copernicusShare: number;
export declare const getRules: ({
  playerResearchRegistry,
  requirementRegistry,
  wonderRegistry,
}?: YieldModifierRegistries) => YieldModifier[];
export default getRules;
