"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const RequirementRegistry_1 = require("@civ-clone/core-requirement/RequirementRegistry");
const WonderRegistry_1 = require("@civ-clone/core-wonder/WonderRegistry");
const Wonders_1 = require("../../Wonders");
const hasWonder_1 = require("@civ-clone/base-wonder/lib/hasWonder");
const Cost_1 = require("@civ-clone/core-city/Rules/Cost");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Priority_1 = require("@civ-clone/core-rule/Priority");
const Unhappiness_1 = require("@civ-clone/base-city-yield-unhappiness/Unhappiness");
const reduceYields_1 = require("@civ-clone/core-yield/lib/reduceYields");
// OpenCiv2 `city_calc_trade_happiness` (richardpenman/civ2@49f26ec), stage 4, after the government's units (which
//  civ2-city-happiness applies at 3500): in Shakespeare's Theatre's city no citizen is unhappy; in each of J. S.
//  Bach's Cathedral's owner's cities 2 fewer are (every city, not only its continent's, as Civ1's).
const getRules = (playerResearchRegistry = PlayerResearchRegistry_1.instance, wonderRegistry = WonderRegistry_1.instance, requirementRegistry = RequirementRegistry_1.instance) => [
    new Cost_1.default('civ2-wonder:city/cost/shakespeares-theatre', new Priority_1.default(4000), (0, hasWonder_1.cityHasWonder)(Wonders_1.ShakespearesTheatre, wonderRegistry, playerResearchRegistry, requirementRegistry), new Effect_1.default((city, yields) => new Unhappiness_1.default(-Math.max(0, (0, reduceYields_1.reduceYield)(yields, Unhappiness_1.default)), Wonders_1.ShakespearesTheatre.name))),
    new Cost_1.default('civ2-wonder:city/cost/js-bachs-cathedral', new Priority_1.default(4000), (0, hasWonder_1.playerHasWonder)(Wonders_1.JsBachsCathedral, wonderRegistry, playerResearchRegistry, requirementRegistry), new Effect_1.default((city, yields) => new Unhappiness_1.default(-Math.max(0, Math.min(2, (0, reduceYields_1.reduceYield)(yields, Unhappiness_1.default))), Wonders_1.JsBachsCathedral.name))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=cost.js.map