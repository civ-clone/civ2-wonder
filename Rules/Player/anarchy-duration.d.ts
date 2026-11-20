import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import { RequirementRegistry } from '@civ-clone/core-requirement/RequirementRegistry';
import { WonderRegistry } from '@civ-clone/core-wonder/WonderRegistry';
import AnarchyDuration from '@civ-clone/base-government-change/Rules/AnarchyDuration';
/** The turns of Anarchy the Statue of Liberty's owner has, read by its rule and by what it says it does. */
export declare const statueOfLibertyAnarchyTurns: number;
export declare const getRules: (
  playerResearchRegistry?: PlayerResearchRegistry,
  wonderRegistry?: WonderRegistry,
  requirementRegistry?: RequirementRegistry
) => AnarchyDuration[];
export default getRules;
