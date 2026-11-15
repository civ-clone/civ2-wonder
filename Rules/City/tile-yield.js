"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Wonders_1 = require("../../Wonders");
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const RequirementRegistry_1 = require("@civ-clone/core-requirement/RequirementRegistry");
const WonderRegistry_1 = require("@civ-clone/core-wonder/WonderRegistry");
const CityTileYield_1 = require("@civ-clone/core-city/Rules/CityTileYield");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Production_1 = require("@civ-clone/base-terrain-yield-production/Production");
const Trade_1 = require("@civ-clone/base-terrain-yield-trade/Trade");
const hasWonder_1 = require("@civ-clone/base-wonder/lib/hasWonder");
const tileYieldPipeline_1 = require("@civ-clone/civ2-city/lib/tileYieldPipeline");
/** What `yields` add up to of `YieldType`, at this step. */
const totalOf = (yields, YieldType) => yields
    .filter((tileYield) => tileYield instanceof YieldType)
    .reduce((total, tileYield) => total + tileYield.value(), 0);
// The Colossus and King Richard's Crusade on each square their city works, as steps of OpenCiv2 `city_tile_yield`
//  (`src/auto/city.cpp`, richardpenman/civ2@49f26ec), at civ2-city's priorities for those steps, so the railroad, the
//  government's penalty and bonus, Superhighways and pollution that follow see them (`lib/tileYieldPipeline`):
// - line 2841, `colossusOcean`: an ocean square gives 1 more trade in the Colossus' city, whatever its trade;
// - line 2890, `colossusLand`: a land square that gives any trade by then (after its river and road) gives 1 more;
// - line 2894, `kingRichards`: every square, ocean too, gives 1 more shield in King Richard's Crusade's city.
// `wonder_get_city` answers no city once a Wonder has expired (`wonder_is_expired`), as `cityHasWonder` does.
const getRules = ({ playerResearchRegistry = PlayerResearchRegistry_1.instance, requirementRegistry = RequirementRegistry_1.instance, wonderRegistry = WonderRegistry_1.instance, } = {}) => {
    const hasColossus = (0, hasWonder_1.cityHasWonder)(Wonders_1.Colossus, wonderRegistry, playerResearchRegistry, requirementRegistry), hasKingRichards = (0, hasWonder_1.cityHasWonder)(Wonders_1.KingRichardsCrusade, wonderRegistry, playerResearchRegistry, requirementRegistry);
    return [
        new CityTileYield_1.default('civ2-wonder:city/tile-yield/colossus-ocean', (0, tileYieldPipeline_1.tileYieldPriority)('colossusOcean'), new Criterion_1.default((city, tile) => tile.isWater()), hasColossus, new Effect_1.default((city, tile, yields) => {
            yields.push(new Trade_1.default(1, Wonders_1.Colossus.name));
        })),
        new CityTileYield_1.default('civ2-wonder:city/tile-yield/colossus-land', (0, tileYieldPipeline_1.tileYieldPriority)('colossusLand'), new Criterion_1.default((city, tile) => tile.isLand()), new Criterion_1.default((city, tile, yields) => totalOf(yields, Trade_1.default) !== 0), hasColossus, new Effect_1.default((city, tile, yields) => {
            yields.push(new Trade_1.default(1, Wonders_1.Colossus.name));
        })),
        new CityTileYield_1.default('civ2-wonder:city/tile-yield/king-richards-crusade', (0, tileYieldPipeline_1.tileYieldPriority)('kingRichards'), hasKingRichards, new Effect_1.default((city, tile, yields) => {
            yields.push(new Production_1.default(1, Wonders_1.KingRichardsCrusade.name));
        })),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=tile-yield.js.map