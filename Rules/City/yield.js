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
const core_pending_effect_1 = require("@civ-clone/core-pending-effect");
const PlayerGovernmentRegistry_1 = require("@civ-clone/core-government/PlayerGovernmentRegistry");
const TileImprovementRegistry_1 = require("@civ-clone/core-tile-improvement/TileImprovementRegistry");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const cityStatus_1 = require("@civ-clone/civ2-city-happiness/lib/cityStatus");
const squareBonus_1 = require("../../lib/squareBonus");
// OpenCiv2 (richardpenman/civ2@49f26ec):
// - `city_tile_yield`: in the Colossus' city each worked square that yields trade (every ocean square, and a land
//   square once its trade isn't 0) gets 1 more; in King Richard's Crusade's city every worked square gets 1 more shield.
//   The +1 comes before the square's later steps (a railroad's half again, the penalty below Monarchy, the Republic's
//   bonus, pollution), so it's worked out through them (`lib/squareBonus`): under Despotism a 2-trade ocean square
//   stays at 2.
// - `city_calc_trade_happiness`: the Hanging Gardens make 1 citizen happy in each of their owner's cities and 2 more in
//   their own; the Cure for Cancer 1 in each of its owner's cities.
// Each Wonder stops once it's obsolete or its city is lost (base-wonder's `cityHasWonder` and `playerHasWonder`).
const getRules = ({ pendingEffects = core_pending_effect_1.instance, playerGovernmentRegistry = PlayerGovernmentRegistry_1.instance, playerResearchRegistry = PlayerResearchRegistry_1.instance, requirementRegistry = RequirementRegistry_1.instance, tileImprovementRegistry = TileImprovementRegistry_1.instance, wonderRegistry = WonderRegistry_1.instance, } = {}) => {
    const governmentOf = (city) => {
        try {
            return playerGovernmentRegistry.getByPlayer(city.player());
        }
        catch (e) {
            return null;
        }
    }, bonus = (city, YieldType, applies) => (0, squareBonus_1.default)(city, YieldType, governmentOf(city), (0, cityStatus_1.leaderCelebration)(city, pendingEffects) !== null, applies, tileImprovementRegistry);
    return [
        new Yield_1.default('civ2-wonder:city/yield/colossus', new Priority_1.default(500), (0, hasWonder_1.cityHasWonder)(Wonders_1.Colossus, wonderRegistry, playerResearchRegistry, requirementRegistry), new Criterion_1.default((city) => bonus(city, Trade_1.default, (before) => before > 0) > 0), new Effect_1.default((city) => new Trade_1.default(bonus(city, Trade_1.default, (before) => before > 0), Wonders_1.Colossus.name))),
        new Yield_1.default('civ2-wonder:city/yield/king-richards-crusade', new Priority_1.default(500), (0, hasWonder_1.cityHasWonder)(Wonders_1.KingRichardsCrusade, wonderRegistry, playerResearchRegistry, requirementRegistry), new Criterion_1.default((city) => bonus(city, Production_1.default, () => true) > 0), new Effect_1.default((city) => new Production_1.default(bonus(city, Production_1.default, () => true), Wonders_1.KingRichardsCrusade.name))),
        new Yield_1.default('civ2-wonder:city/yield/hanging-gardens', (0, hasWonder_1.playerHasWonder)(Wonders_1.HangingGardens, wonderRegistry, playerResearchRegistry, requirementRegistry), new Effect_1.default(() => new Happiness_1.default(1, Wonders_1.HangingGardens.name))),
        new Yield_1.default('civ2-wonder:city/yield/hanging-gardens-city', (0, hasWonder_1.cityHasWonder)(Wonders_1.HangingGardens, wonderRegistry, playerResearchRegistry, requirementRegistry), new Effect_1.default(() => new Happiness_1.default(2, Wonders_1.HangingGardens.name))),
        new Yield_1.default('civ2-wonder:city/yield/cure-for-cancer', (0, hasWonder_1.playerHasWonder)(Wonders_1.CureForCancer, wonderRegistry, playerResearchRegistry, requirementRegistry), new Effect_1.default(() => new Happiness_1.default(1, Wonders_1.CureForCancer.name))),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=yield.js.map