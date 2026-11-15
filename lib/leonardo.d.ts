import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import { RequirementRegistry } from '@civ-clone/core-requirement/RequirementRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { TransportRegistry } from '@civ-clone/core-unit-transport/TransportRegistry';
import { UnitRegistry } from '@civ-clone/core-unit/UnitRegistry';
import { Upgrade } from '@civ-clone/base-unit-upgrade/lib/upgradeUnits';
import { WonderRegistry } from '@civ-clone/core-wonder/WonderRegistry';
import Player from '@civ-clone/core-player/Player';
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
export declare const leonardoUpgrade: ({
  playerResearchRegistry,
  requirementRegistry,
  ruleRegistry,
  transportRegistry,
  unitRegistry,
  wonderRegistry,
}?: LeonardoRegistries) => (player: Player) => Upgrade[];
/** The capture pass for `player` runs after the next advance they're given, the one they take from the city. */
export declare const afterStolenAdvance: (player: Player) => void;
/** Whether `player`'s capture pass was waiting for this advance; it no longer waits. */
export declare const stolenAdvanceArrived: (player: Player) => boolean;
export default leonardoUpgrade;
