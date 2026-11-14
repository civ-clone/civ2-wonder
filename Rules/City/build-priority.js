"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const CityBuildRegistry_1 = require("@civ-clone/core-city-build/CityBuildRegistry");
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const Wonders_1 = require("../../Wonders");
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const RequirementRegistry_1 = require("@civ-clone/core-requirement/RequirementRegistry");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const Naval_1 = require("@civ-clone/base-unit-type-naval/Naval");
const Production_1 = require("@civ-clone/base-terrain-yield-production/Production");
const traits_1 = require("@civ-clone/core-unit/traits");
const buildPriority_1 = require("@civ-clone/base-wonder/lib/buildPriority");
/**
 * How much a city on Auto, or a computer player, wants a Wonder: base-wonder's rule with civ1-wonder's numbers, until
 *  the AI's own Wonder choice (OpenCiv2 `city_choose_production_wonder_bias`) is ported. The Lighthouse and Magellan's
 *  only help ships; the Manhattan Project lets every player build nuclear weapons, so is never wanted.
 */
const getRules = (cityRegistry = CityRegistry_1.instance, cityBuildRegistry = CityBuildRegistry_1.instance, playerResearchRegistry = PlayerResearchRegistry_1.instance, unitRegistry = UnitRegistry_1.instance, requirementRegistry = RequirementRegistry_1.instance) => (0, buildPriority_1.wonderPriorityRules)('civ2-wonder', {
    Production: Production_1.default,
    isShip: (unit) => (0, traits_1.isA)(unit, Naval_1.default),
    forShips: [Wonders_1.Lighthouse, Wonders_1.MagellansExpedition],
    neverWanted: [Wonders_1.ManhattanProject],
}, cityRegistry, cityBuildRegistry, playerResearchRegistry, unitRegistry, requirementRegistry);
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=build-priority.js.map