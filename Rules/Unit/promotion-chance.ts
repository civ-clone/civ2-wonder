import {
  PlayerResearchRegistry,
  instance as playerResearchRegistryInstance,
} from '@civ-clone/core-science/PlayerResearchRegistry';
import {
  RequirementRegistry,
  instance as requirementRegistryInstance,
} from '@civ-clone/core-requirement/RequirementRegistry';
import {
  WonderRegistry,
  instance as wonderRegistryInstance,
} from '@civ-clone/core-wonder/WonderRegistry';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import { PromotionChance } from '@civ-clone/base-unit-veteran-promotion/lib/Rules';
import { SunTzusWarAcademy } from '../../Wonders';
import Unit from '@civ-clone/core-unit/Unit';
import { playerOwnsWonder } from '@civ-clone/base-wonder/lib/hasWonder';

/**
 * Sun Tzu's War Academy: every unit of its owner that wins a battle becomes a veteran (OpenCiv2
 *  `unit_resolve_attack_veterans`, richardpenman/civ2@49f26ec, asks `civ_has_wonder` for the winner's civilization),
 *  while the Wonder stands and isn't obsolete. A missile still never does: civ2-unit's promotion rule leaves it out
 *  before the chance is asked.
 */
export const getRules = (
  wonderRegistry: WonderRegistry = wonderRegistryInstance,
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance,
  requirementRegistry: RequirementRegistry = requirementRegistryInstance
): PromotionChance[] => [
  new PromotionChance(
    'civ2-wonder:unit/promotion-chance/sun-tzus-war-academy',
    new Criterion((winner: Unit): boolean =>
      playerOwnsWonder(
        winner.player(),
        SunTzusWarAcademy,
        wonderRegistry,
        playerResearchRegistry,
        requirementRegistry
      )
    ),
    new Effect((): number => 1)
  ),
];

export default getRules;
