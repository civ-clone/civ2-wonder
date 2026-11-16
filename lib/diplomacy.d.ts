import { InteractionRegistry } from '@civ-clone/core-diplomacy/InteractionRegistry';
import { PendingEffectRegistry } from '@civ-clone/core-pending-effect';
import { PlayerRegistry } from '@civ-clone/core-player/PlayerRegistry';
import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import { RequirementRegistry } from '@civ-clone/core-requirement/RequirementRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { Turn } from '@civ-clone/core-turn-based-game/Turn';
import { WonderRegistry } from '@civ-clone/core-wonder/WonderRegistry';
import BuildingComplete from '@civ-clone/core-city-build/Rules/BulidingComplete';
import Captured from '@civ-clone/core-city/Rules/Captured';
import HasEmbassy from '@civ-clone/base-diplomacy/Rules/HasEmbassy';
import Wonder from '@civ-clone/core-wonder/Wonder';
import Created from '@civ-clone/core-diplomacy/Rules/Interaction/Created';
export interface DiplomacyRegistries {
  interactionRegistry?: InteractionRegistry;
  pendingEffectRegistry?: PendingEffectRegistry;
  playerRegistry?: PlayerRegistry;
  playerResearchRegistry?: PlayerResearchRegistry;
  requirementRegistry?: RequirementRegistry;
  ruleRegistry?: RuleRegistry;
  turn?: Turn;
  wonderRegistry?: WonderRegistry;
}
/** The wonders that act as an embassy with every other player, for their owner, with the rule that says so. */
export declare const embassyWonders: [typeof Wonder, string][];
/**
 * The diplomatic parts of Civilization II's wonders that aren't in civ2-diplomacy's own formulas (OpenCiv2,
 *  richardpenman/civ2@e39fe7b). civ2-diplomacy reads who owns Marco Polo's, the Great Wall, the United Nations, the
 *  Eiffel Tower and Magellan's Expedition itself, for the talks, the Senate, patience, reputation's recovery and share
 *  maps. Expired wonders count as absent (base-wonder's `playerOwnsWonder`, with civ2-wonder's expiries in the
 *  requirements).
 * - **Marco Polo's Embassy and the United Nations** act as an embassy with every other player for their owner
 *   (base-diplomacy's `HasEmbassy`; they set no `Embassy`, as the original sets no flag). They make no contact.
 * - **The Eiffel Tower** (`civ_apply_eiffel_tower`, `civ.cpp:6794-6812`), once for each player, when it is built or
 *   captured: its owner's reputation is halved (rounded down), every other player's attitude to it falls by 25, and
 *   every vendetta held against it ends. That it was applied is kept as a `PendingEffect` (`EIFFEL_TOWER_APPLIED`) on
 *   the player, which is never discharged, as the original's `CIVF_EIFFEL_APPLIED`. The original lowers every
 *   civilization's attitude, met or not; here an attitude is seeded when a pair meets (civ2-diplomacy), so a player
 *   that meets the owner later has its seeded attitude to it lowered by 25 then (`EIFFEL_TOWER_CONTACT_RULE`, after
 *   the seeding).
 * - **The Manhattan Project** (`city_production.cpp:2435-2438`), when it is built: every player's reputation becomes
 *   (reputation + 1) / 2, rounded down, at most 6.
 *
 * Barbarians take no part.
 */
export declare const getRules: ({
  interactionRegistry,
  pendingEffectRegistry,
  playerRegistry,
  playerResearchRegistry,
  requirementRegistry,
  ruleRegistry,
  turn,
  wonderRegistry,
}?: DiplomacyRegistries) => (
  | HasEmbassy
  | BuildingComplete
  | Captured
  | Created
)[];
export default getRules;
