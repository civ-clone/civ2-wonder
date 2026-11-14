import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import { RequirementRegistry } from '@civ-clone/core-requirement/RequirementRegistry';
import { WonderRegistry } from '@civ-clone/core-wonder/WonderRegistry';
import Availability from '@civ-clone/core-government/Rules/Availability';
import Government from '@civ-clone/core-government/Government';
/** Every government but Anarchy (Despotism is always offered anyway). */
export declare const statueOfLibertyGovernments: (typeof Government)[];
export declare const getRules: (
  playerResearchRegistry?: PlayerResearchRegistry,
  wonderRegistry?: WonderRegistry,
  requirementRegistry?: RequirementRegistry
) => Availability[];
export default getRules;
