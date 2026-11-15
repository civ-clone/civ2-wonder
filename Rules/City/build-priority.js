"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const CityBuildRegistry_1 = require("@civ-clone/core-city-build/CityBuildRegistry");
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const Wonders_1 = require("../../Wonders");
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const RequirementRegistry_1 = require("@civ-clone/core-requirement/RequirementRegistry");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const BuildPriority_1 = require("@civ-clone/core-city-build/Rules/BuildPriority");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Naval_1 = require("@civ-clone/base-unit-type-naval/Naval");
const Production_1 = require("@civ-clone/base-terrain-yield-production/Production");
const traits_1 = require("@civ-clone/core-unit/traits");
const buildPriority_1 = require("@civ-clone/base-wonder/lib/buildPriority");
/**
 * How much a computer player wants a Wonder: base-wonder's rule with civ1-wonder's numbers, until the AI's own Wonder
 *  choice (OpenCiv2 `city_choose_production_wonder_bias`) is ported. The Lighthouse and Magellan's only help ships; the
 *  Manhattan Project lets every player build nuclear weapons, so is never wanted.
 *
 * Not for a city on Auto: civ2-city ranks those with Civ2's own scores (`city_choose_production_improvement_score`), on
 *  another scale. base-wonder's rule takes no extra criterion, so each is wrapped: the same id and priority, a city not
 *  on Auto, then the rule's own criteria and effect.
 */
const getRules = (cityRegistry = CityRegistry_1.instance, cityBuildRegistry = CityBuildRegistry_1.instance, playerResearchRegistry = PlayerResearchRegistry_1.instance, unitRegistry = UnitRegistry_1.instance, requirementRegistry = RequirementRegistry_1.instance) => (0, buildPriority_1.wonderPriorityRules)('civ2-wonder', {
    Production: Production_1.default,
    isShip: (unit) => (0, traits_1.isA)(unit, Naval_1.default),
    forShips: [Wonders_1.Lighthouse, Wonders_1.MagellansExpedition],
    neverWanted: [Wonders_1.ManhattanProject],
}, cityRegistry, cityBuildRegistry, playerResearchRegistry, unitRegistry, requirementRegistry).map((rule) => new BuildPriority_1.default(rule.id(), rule.priority(), new Criterion_1.default((cityBuild) => !cityBuild.auto()), new Criterion_1.default((cityBuild, BuildItem, yields) => rule.validate(cityBuild, BuildItem, yields)), new Effect_1.default((cityBuild, BuildItem, yields) => rule.process(cityBuild, BuildItem, yields))));
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=build-priority.js.map