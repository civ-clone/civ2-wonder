"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stolenAdvanceArrived = exports.afterStolenAdvance = exports.leonardoUpgrade = void 0;
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const RequirementRegistry_1 = require("@civ-clone/core-requirement/RequirementRegistry");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const TransportRegistry_1 = require("@civ-clone/core-unit-transport/TransportRegistry");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const upgradeUnits_1 = require("@civ-clone/base-unit-upgrade/lib/upgradeUnits");
const WonderRegistry_1 = require("@civ-clone/core-wonder/WonderRegistry");
const Wonders_1 = require("../Wonders");
const hasWonder_1 = require("@civ-clone/base-wonder/lib/hasWonder");
const upgrade_1 = require("@civ-clone/civ2-unit/lib/upgrade");
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
const leonardoUpgrade = ({ playerResearchRegistry = PlayerResearchRegistry_1.instance, requirementRegistry = RequirementRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance, transportRegistry = TransportRegistry_1.instance, unitRegistry = UnitRegistry_1.instance, wonderRegistry = WonderRegistry_1.instance, } = {}) => {
    const options = (0, upgrade_1.upgradeOptions)({
        playerResearchRegistry,
        ruleRegistry,
        transportRegistry,
        unitRegistry,
    });
    return (player) => (0, hasWonder_1.playerOwnsWonder)(player, Wonders_1.LeonardosWorkshop, wonderRegistry, playerResearchRegistry, requirementRegistry)
        ? (0, upgradeUnits_1.default)(player, options)
        : [];
};
exports.leonardoUpgrade = leonardoUpgrade;
/**
 * Captors whose capture pass waits for the advance they take from the city (see `Rules/City/captured`). Players are
 *  one game's own, so one set serves every game; it isn't saved (a game saved while a captor chooses loses the pass).
 */
const awaitingSteal = new WeakSet();
/** The capture pass for `player` runs after the next advance they're given, the one they take from the city. */
const afterStolenAdvance = (player) => {
    awaitingSteal.add(player);
};
exports.afterStolenAdvance = afterStolenAdvance;
/** Whether `player`'s capture pass was waiting for this advance; it no longer waits. */
const stolenAdvanceArrived = (player) => awaitingSteal.delete(player);
exports.stolenAdvanceArrived = stolenAdvanceArrived;
exports.default = exports.leonardoUpgrade;
//# sourceMappingURL=leonardo.js.map