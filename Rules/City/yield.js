"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const RequirementRegistry_1 = require("@civ-clone/core-requirement/RequirementRegistry");
const WonderRegistry_1 = require("@civ-clone/core-wonder/WonderRegistry");
const Wonders_1 = require("../../Wonders");
const hasWonder_1 = require("@civ-clone/base-wonder/lib/hasWonder");
const Yield_1 = require("@civ-clone/core-city/Rules/Yield");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Happiness_1 = require("@civ-clone/base-city-yield-happiness/Happiness");
const Priority_1 = require("@civ-clone/core-rule/Priority");
const Production_1 = require("@civ-clone/base-terrain-yield-production/Production");
const Trade_1 = require("@civ-clone/base-terrain-yield-trade/Trade");
// OpenCiv2 (richardpenman/civ2@49f26ec):
// - `city_tile_yield`: in the Colossus' city each worked square that yields trade (every ocean square, and a land
//   square once its trade isn't 0) yields 1 more; in King Richard's Crusade's city every worked square yields 1 more
//   shield.
// - `city_calc_trade_happiness`: the Hanging Gardens make 1 citizen happy in each of their owner's cities and 2 more in
//   their own; the Cure for Cancer 1 in each of its owner's cities.
// Each Wonder stops once it's obsolete or its city is lost (base-wonder's `cityHasWonder` and `playerHasWonder`).
const getRules = (playerResearchRegistry = PlayerResearchRegistry_1.instance, wonderRegistry = WonderRegistry_1.instance, requirementRegistry = RequirementRegistry_1.instance) => [
    new Yield_1.default('civ2-wonder:city/yield/colossus', new Priority_1.default(500), (0, hasWonder_1.cityHasWonder)(Wonders_1.Colossus, wonderRegistry, playerResearchRegistry, requirementRegistry), new Effect_1.default((city) => new Trade_1.default(city
        .tilesWorked()
        .filter((tile) => tile
        .yields()
        .some((tileYield) => tileYield instanceof Trade_1.default)).length, Wonders_1.Colossus.name))),
    new Yield_1.default('civ2-wonder:city/yield/king-richards-crusade', new Priority_1.default(500), (0, hasWonder_1.cityHasWonder)(Wonders_1.KingRichardsCrusade, wonderRegistry, playerResearchRegistry, requirementRegistry), new Effect_1.default((city) => new Production_1.default(city.tilesWorked().length, Wonders_1.KingRichardsCrusade.name))),
    new Yield_1.default('civ2-wonder:city/yield/hanging-gardens', (0, hasWonder_1.playerHasWonder)(Wonders_1.HangingGardens, wonderRegistry, playerResearchRegistry, requirementRegistry), new Effect_1.default(() => new Happiness_1.default(1, Wonders_1.HangingGardens.name))),
    new Yield_1.default('civ2-wonder:city/yield/hanging-gardens-city', (0, hasWonder_1.cityHasWonder)(Wonders_1.HangingGardens, wonderRegistry, playerResearchRegistry, requirementRegistry), new Effect_1.default(() => new Happiness_1.default(2, Wonders_1.HangingGardens.name))),
    new Yield_1.default('civ2-wonder:city/yield/cure-for-cancer', (0, hasWonder_1.playerHasWonder)(Wonders_1.CureForCancer, wonderRegistry, playerResearchRegistry, requirementRegistry), new Effect_1.default(() => new Happiness_1.default(1, Wonders_1.CureForCancer.name))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=yield.js.map