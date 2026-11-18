"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.manhattanProjectRules = exports.wantsManhattanProject = exports.MANHATTAN_PROJECT_BIAS = exports.NEVER_WANTED = exports.getRules = void 0;
const CityBuildRegistry_1 = require("@civ-clone/core-city-build/CityBuildRegistry");
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const Wonders_1 = require("../../Wonders");
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const RequirementRegistry_1 = require("@civ-clone/core-requirement/RequirementRegistry");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const Aggressive_1 = require("@civ-clone/base-leader-trait-aggression/Aggression/Aggressive");
const BuildPriority_1 = require("@civ-clone/core-city-build/Rules/BuildPriority");
const Rocketry_1 = require("@civ-clone/base-science-advance-rocketry/Rocketry");
const isHuman_1 = require("@civ-clone/base-difficulty/lib/isHuman");
const leaderTraits_1 = require("@civ-clone/base-leader-personality/lib/leaderTraits");
const strength_1 = require("@civ-clone/core-power/lib/strength");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Naval_1 = require("@civ-clone/base-unit-type-naval/Naval");
const Production_1 = require("@civ-clone/base-terrain-yield-production/Production");
const traits_1 = require("@civ-clone/core-unit/traits");
const buildPriority_1 = require("@civ-clone/base-wonder/lib/buildPriority");
/**
 * How much a computer player wants a Wonder: base-wonder's rule with civ1-wonder's numbers, until the AI's own Wonder
 *  choice (OpenCiv2 `city_choose_production_wonder_bias`) is ported. The Lighthouse and Magellan's only help ships; the
 *  Manhattan Project is wanted only where `manhattanProjectRules` says (an aggressive leader's).
 *
 * Not for a city on Auto: civ2-city ranks those with Civ2's own scores (`city_choose_production_improvement_score`), on
 *  another scale. base-wonder's rule takes no extra criterion, so each is wrapped: the same id and priority, a city not
 *  on Auto, then the rule's own criteria and effect.
 */
const getRules = (cityRegistry = CityRegistry_1.instance, cityBuildRegistry = CityBuildRegistry_1.instance, playerResearchRegistry = PlayerResearchRegistry_1.instance, unitRegistry = UnitRegistry_1.instance, requirementRegistry = RequirementRegistry_1.instance) => (0, buildPriority_1.wonderPriorityRules)('civ2-wonder', {
    Production: Production_1.default,
    isShip: (unit) => (0, traits_1.isA)(unit, Naval_1.default),
    forShips: [Wonders_1.Lighthouse, Wonders_1.MagellansExpedition],
    // The Manhattan Project is for `manhattanProjectRules` to say.
}, cityRegistry, cityBuildRegistry, playerResearchRegistry, unitRegistry, requirementRegistry).map((rule) => new BuildPriority_1.default(rule.id(), rule.priority(), new Criterion_1.default((cityBuild) => !cityBuild.auto()), new Criterion_1.default((cityBuild, BuildItem, yields) => rule.validate(cityBuild, BuildItem, yields)), new Effect_1.default((cityBuild, BuildItem, yields) => rule.process(cityBuild, BuildItem, yields))));
exports.getRules = getRules;
// Below anything a computer player's city would build: what `manhattanProjectRules` gives the Manhattan Project for a
//  player that doesn't want it, so that it isn't built at all.
exports.NEVER_WANTED = -1000;
// What `manhattanProjectRules` adds for a player that wants the Manhattan Project, on top of the Wonder priority every
//  Wonder gets: the original ranks it ahead of other Wonders for an aggressive, militaristic leader (its score, lowest
//  wanted most, less the leader's attack attitude and twice its civilize attitude), so here it scores twice a Wonder's.
exports.MANHATTAN_PROJECT_BIAS = buildPriority_1.wonderPriority;
/**
 * Whether a computer player wants the Manhattan Project, which lets every player build nuclear weapons: its leader's
 *  attack attitude is aggressive, it knows Rocketry, and no person who knows Rocketry is weaker than it (OpenCiv2
 *  `city_choose_production_wonder_bias`, `city_production.cpp:1240-1263`, where a weaker person with Rocketry rules it
 *  out). The original scores it for any leader, more for a militaristic and aggressive one; here only an aggressive
 *  leader wants it at all.
 */
const wantsManhattanProject = ({ clientRegistry, playerRegistry, playerResearchRegistry, ruleRegistry, traitRegistry, unitRegistry, }, player) => {
    const knowsRocketry = (other) => playerResearchRegistry.getByPlayer(other).completed(Rocketry_1.default), power = (other) => (0, strength_1.militaryPower)(unitRegistry.getByPlayer(other), ruleRegistry);
    return ((0, leaderTraits_1.default)(traitRegistry, player).some((trait) => trait instanceof Aggressive_1.default) &&
        knowsRocketry(player) &&
        !playerRegistry
            .entries()
            .some((other) => other !== player &&
            (0, isHuman_1.default)(other, clientRegistry) &&
            knowsRocketry(other) &&
            power(other) < power(player)));
};
exports.wantsManhattanProject = wantsManhattanProject;
/**
 * `civ2-wonder:city/build-priority/manhattan-project`: for a city not on Auto, the Manhattan Project scores
 *  `NEVER_WANTED` for a player that doesn't want it (`wantsManhattanProject`), and `MANHATTAN_PROJECT_BIAS` more than
 *  `getRules`' Wonder priority for one that does.
 */
const manhattanProjectRules = (dependencies) => [
    new BuildPriority_1.default('civ2-wonder:city/build-priority/manhattan-project', new Criterion_1.default((cityBuild) => !cityBuild.auto()), new Criterion_1.default((cityBuild, BuildItem) => BuildItem === Wonders_1.ManhattanProject), new Effect_1.default((cityBuild) => (0, exports.wantsManhattanProject)(dependencies, cityBuild.city().player())
        ? exports.MANHATTAN_PROJECT_BIAS
        : exports.NEVER_WANTED)),
];
exports.manhattanProjectRules = manhattanProjectRules;
exports.default = exports.getRules;
//# sourceMappingURL=build-priority.js.map