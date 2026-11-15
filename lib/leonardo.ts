import {
  PlayerResearchRegistry,
  instance as playerResearchRegistryInstance,
} from '@civ-clone/core-science/PlayerResearchRegistry';
import {
  RequirementRegistry,
  instance as requirementRegistryInstance,
} from '@civ-clone/core-requirement/RequirementRegistry';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  TransportRegistry,
  instance as transportRegistryInstance,
} from '@civ-clone/core-unit-transport/TransportRegistry';
import {
  UnitRegistry,
  instance as unitRegistryInstance,
} from '@civ-clone/core-unit/UnitRegistry';
import upgradeUnits, {
  Upgrade,
} from '@civ-clone/base-unit-upgrade/lib/upgradeUnits';
import {
  WonderRegistry,
  instance as wonderRegistryInstance,
} from '@civ-clone/core-wonder/WonderRegistry';
import { LeonardosWorkshop } from '../Wonders';
import Player from '@civ-clone/core-player/Player';
import { playerOwnsWonder } from '@civ-clone/base-wonder/lib/hasWonder';
import { upgradeOptions } from '@civ-clone/civ2-unit/lib/upgrade';

export interface LeonardoRegistries {
  playerResearchRegistry?: PlayerResearchRegistry;
  requirementRegistry?: RequirementRegistry;
  ruleRegistry?: RuleRegistry;
  transportRegistry?: TransportRegistry;
  unitRegistry?: UnitRegistry;
  wonderRegistry?: WonderRegistry;
}

/**
 * OpenCiv2 `civ_leonardo_upgrade` (`src/auto/civ.cpp`, richardpenman/civ2@49f26ec): if `player` holds Leonardo's
 *  Workshop (`civ_has_wonder`, which goes through `wonder_get_city` and so answers no once the Wonder has expired, when
 *  any civilization knows Automobile), every one of their units that has an upgrade becomes it, all at once, one step
 *  each (civ2-unit's table, base-unit-upgrade's `upgradeUnits`). Returns what was upgraded.
 *
 * The original calls it from `civ_give_advance` for the player given any advance (researched, stolen, traded, from a
 *  hut or the Great Library) after the advance is theirs, so the advance that expires the Wonder upgrades nothing; from
 *  `city_process_production_complete_improvement` when the Wonder is completed; and for the new owner when the
 *  Wonder's city changes hands (`city_capture`, and a city given in a treaty).
 */
export const leonardoUpgrade = ({
  playerResearchRegistry = playerResearchRegistryInstance,
  requirementRegistry = requirementRegistryInstance,
  ruleRegistry = ruleRegistryInstance,
  transportRegistry = transportRegistryInstance,
  unitRegistry = unitRegistryInstance,
  wonderRegistry = wonderRegistryInstance,
}: LeonardoRegistries = {}): ((player: Player) => Upgrade[]) => {
  const options = upgradeOptions({
    playerResearchRegistry,
    ruleRegistry,
    transportRegistry,
    unitRegistry,
  });

  return (player: Player): Upgrade[] =>
    playerOwnsWonder(
      player,
      LeonardosWorkshop,
      wonderRegistry,
      playerResearchRegistry,
      requirementRegistry
    )
      ? upgradeUnits(player, options)
      : [];
};

/**
 * Captors whose capture pass waits for the advance they take from the city (see `Rules/City/captured`). Players are
 *  one game's own, so one set serves every game; it isn't saved (a game saved while a captor chooses loses the pass).
 */
const awaitingSteal = new WeakSet<Player>();

/** The capture pass for `player` runs after the next advance they're given, the one they take from the city. */
export const afterStolenAdvance = (player: Player): void => {
  awaitingSteal.add(player);
};

/** Whether `player`'s capture pass was waiting for this advance; it no longer waits. */
export const stolenAdvanceArrived = (player: Player): boolean =>
  awaitingSteal.delete(player);

export default leonardoUpgrade;
