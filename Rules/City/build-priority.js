"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.manhattanProjectRules = exports.wantsManhattanProject = exports.manhattanProjectBias = exports.NEVER_WANTED = exports.getRules = void 0;
const CityBuildRegistry_1 = require("@civ-clone/core-city-build/CityBuildRegistry");
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const Wonders_1 = require("../../Wonders");
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const RequirementRegistry_1 = require("@civ-clone/core-requirement/RequirementRegistry");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const Aggressive_1 = require("@civ-clone/base-leader-trait-aggression/Aggression/Aggressive");
const Civilized_1 = require("@civ-clone/base-leader-trait-militarism/Militarism/Civilized");
const Militaristic_1 = require("@civ-clone/base-leader-trait-militarism/Militarism/Militaristic");
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
// What `manhattanProjectRules` adds for a player that wants the Manhattan Project, by its leader's civilize attitude
//  (militaristic −1, normal 0, civilized 1): the original adds `civilize × 2 − attack` to its score (lowest wanted
//  most), so an aggressive (attack 1) leader's is 3 better than a plain Wonder's when militaristic, 1 better when
//  normal and 1 worse when civilized. Here that's half a Wonder priority for each point: 2.25, 0.75 and −0.75, on top of
//  the Wonder priority's 1.5.
const manhattanProjectBias = (civilize) => (buildPriority_1.wonderPriority * (1 - 2 * civilize)) / 2;
exports.manhattanProjectBias = manhattanProjectBias;
/**
 * Whether a computer player wants the Manhattan Project, which lets every player build nuclear weapons: its leader's
 *  attack attitude is aggressive, it knows Rocketry, and no person still in the game who knows Rocketry is weaker than
 *  it (OpenCiv2 `city_choose_production_wonder_bias`, `city_production.cpp:1240-1263`, where a weaker person with
 *  Rocketry rules it out). The original scores it for any leader; here only an aggressive leader wants it at all.
 *  Strength is base's `militaryPower` (attack and defence of all the player's units), not the original's stored
 *  military strength.
 */
// The leader's civilize attitude: −1 militaristic, 1 civilized, 0 otherwise.
const civilizeOf = (traitRegistry, player) => {
    const traits = (0, leaderTraits_1.default)(traitRegistry, player);
    return traits.some((trait) => trait instanceof Militaristic_1.default)
        ? -1
        : traits.some((trait) => trait instanceof Civilized_1.default)
            ? 1
            : 0;
};
const wantsManhattanProject = ({ clientRegistry, playerRegistry, playerResearchRegistry, ruleRegistry, traitRegistry, unitRegistry, }, player) => {
    const knowsRocketry = (other) => playerResearchRegistry.getByPlayer(other).completed(Rocketry_1.default), power = (other) => (0, strength_1.militaryPower)(unitRegistry.getByPlayer(other), ruleRegistry);
    let own = null;
    return ((0, leaderTraits_1.default)(traitRegistry, player).some((trait) => trait instanceof Aggressive_1.default) &&
        knowsRocketry(player) &&
        !playerRegistry.entries().some((other) => other !== player &&
            (0, isHuman_1.default)(other, clientRegistry) &&
            // A person still in the game: one destroyed has no units, and would always count as weaker.
            unitRegistry.getByPlayer(other).length > 0 &&
            knowsRocketry(other) &&
            power(other) < (own !== null && own !== void 0 ? own : (own = power(player)))));
};
exports.wantsManhattanProject = wantsManhattanProject;
/**
 * `civ2-wonder:city/build-priority/manhattan-project`: for a city not on Auto, the Manhattan Project scores
 *  `NEVER_WANTED` for a player that doesn't want it (`wantsManhattanProject`), and `manhattanProjectBias` for one that
 *  does. The bias stands on its own: `getRules`' Wonder priority adds 1.5 where its own criteria hold (the city makes 5
 *  shields or more, and no other city of the player's is building it), and doesn't where they don't.
 */
const manhattanProjectRules = (dependencies) => [
    new BuildPriority_1.default('civ2-wonder:city/build-priority/manhattan-project', new Criterion_1.default((cityBuild) => !cityBuild.auto()), new Criterion_1.default((cityBuild, BuildItem) => BuildItem === Wonders_1.ManhattanProject), new Effect_1.default((cityBuild) => {
        const player = cityBuild.city().player();
        return (0, exports.wantsManhattanProject)(dependencies, player)
            ? (0, exports.manhattanProjectBias)(civilizeOf(dependencies.traitRegistry, player))
            : exports.NEVER_WANTED;
    })),
];
exports.manhattanProjectRules = manhattanProjectRules;
exports.default = exports.getRules;
//# sourceMappingURL=build-priority.js.map