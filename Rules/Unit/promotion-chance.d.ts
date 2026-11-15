import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import { RequirementRegistry } from '@civ-clone/core-requirement/RequirementRegistry';
import { WonderRegistry } from '@civ-clone/core-wonder/WonderRegistry';
import { PromotionChance } from '@civ-clone/base-unit-veteran-promotion/lib/Rules';
/**
 * Sun Tzu's War Academy: every unit of its owner that wins a battle becomes a veteran (OpenCiv2
 *  `unit_resolve_attack_veterans`, richardpenman/civ2@49f26ec, asks `civ_has_wonder` for the winner's civilization),
 *  while the Wonder stands and isn't obsolete. A missile still never does: civ2-unit's promotion rule leaves it out
 *  before the chance is asked.
 */
export declare const getRules: (
  wonderRegistry?: WonderRegistry,
  playerResearchRegistry?: PlayerResearchRegistry,
  requirementRegistry?: RequirementRegistry
) => PromotionChance[];
export default getRules;
