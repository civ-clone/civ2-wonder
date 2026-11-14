"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = exports.newtonsShare = exports.scienceBuildings = void 0;
const CityImprovementRegistry_1 = require("@civ-clone/core-city-improvement/CityImprovementRegistry");
const Wonders_1 = require("../../Wonders");
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const RequirementRegistry_1 = require("@civ-clone/core-requirement/RequirementRegistry");
const WonderRegistry_1 = require("@civ-clone/core-wonder/WonderRegistry");
const hasImprovementOrWonder_1 = require("@civ-clone/base-wonder/lib/hasImprovementOrWonder");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Library_1 = require("@civ-clone/base-city-improvement-library/Library");
const Priorities_1 = require("@civ-clone/core-rule/Priorities");
const Priority_1 = require("@civ-clone/core-rule/Priority");
const Research_1 = require("@civ-clone/base-city-yield-research/Research");
const ResearchLab_1 = require("@civ-clone/base-city-improvement-researchlab/ResearchLab");
const University_1 = require("@civ-clone/base-city-improvement-university/University");
const YieldModifier_1 = require("@civ-clone/core-city/Rules/YieldModifier");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const hasWonder_1 = require("@civ-clone/base-wonder/lib/hasWonder");
const reduceYields_1 = require("@civ-clone/core-yield/lib/reduceYields");
/**
 * How many science buildings `city` counts (OpenCiv2 `city_split_trade`, richardpenman/civ2@49f26ec): a Library, a
 *  University, and a Research Lab or the SETI Program (one test: civ2-city-improvement owns that site).
 */
const scienceBuildings = (city, { cityImprovementRegistry = CityImprovementRegistry_1.instance, playerResearchRegistry = PlayerResearchRegistry_1.instance, requirementRegistry = RequirementRegistry_1.instance, wonderRegistry = WonderRegistry_1.instance, } = {}) => [Library_1.default, University_1.default].filter((Improvement) => (0, hasImprovementOrWonder_1.cityHasImprovement)(city, Improvement, cityImprovementRegistry)).length +
    ((0, hasImprovementOrWonder_1.cityHasImprovementOrWonder)(city, ResearchLab_1.default, Wonders_1.SetiProgram, {
        cityImprovementRegistry,
        playerResearchRegistry,
        requirementRegistry,
        wonderRegistry,
    })
        ? 1
        : 0);
exports.scienceBuildings = scienceBuildings;
/**
 * Isaac Newton's College's share of its city's science: Civilization II adds the city's base science times its science
 *  buildings, halved (`city_split_trade`) except in Newton's city. So the college adds what the halving takes away,
 *  `base × buildings − ⌊base × buildings / 2⌋`, on top of the buildings' own half each (civ2-city-improvement's).
 */
const newtonsShare = (base, buildings) => base * buildings - Math.floor((base * buildings) / 2);
exports.newtonsShare = newtonsShare;
// OpenCiv2 `city_split_trade` (richardpenman/civ2@49f26ec): Isaac Newton's College doubles its city's science
//  buildings' bonus; then the Copernicus Observatory doubles its city's science, after every other bonus.
const getRules = ({ cityImprovementRegistry = CityImprovementRegistry_1.instance, playerResearchRegistry = PlayerResearchRegistry_1.instance, requirementRegistry = RequirementRegistry_1.instance, wonderRegistry = WonderRegistry_1.instance, } = {}) => {
    const registries = {
        cityImprovementRegistry,
        playerResearchRegistry,
        requirementRegistry,
        wonderRegistry,
    };
    return [
        new YieldModifier_1.default('civ2-wonder:city/yield-modifier/isaac-newtons-college', new Priorities_1.Low(), (0, hasWonder_1.cityHasWonder)(Wonders_1.IsaacNewtonsCollege, wonderRegistry, playerResearchRegistry, requirementRegistry), new Criterion_1.default((city) => (0, exports.scienceBuildings)(city, registries) > 0), new Effect_1.default((city, yields, base) => new Research_1.default((0, exports.newtonsShare)((0, reduceYields_1.reduceYield)(base, Research_1.default), (0, exports.scienceBuildings)(city, registries)), Wonders_1.IsaacNewtonsCollege.name))),
        new YieldModifier_1.default('civ2-wonder:city/yield-modifier/copernicus-observatory', new Priority_1.default(4000), // X Low: after every `Low` modifier
        (0, hasWonder_1.cityHasWonder)(Wonders_1.CopernicusObservatory, wonderRegistry, playerResearchRegistry, requirementRegistry), new Effect_1.default((city, yields) => new Research_1.default((0, reduceYields_1.reduceYield)(yields, Research_1.default), Wonders_1.CopernicusObservatory.name))),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=yield-modifier.js.map