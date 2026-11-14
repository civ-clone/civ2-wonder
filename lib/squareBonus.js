"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.squareBonus = exports.beforeLaterSteps = exports.throughLaterSteps = void 0;
const governmentTileYield_1 = require("@civ-clone/civ2-world/lib/governmentTileYield");
const TileImprovementRegistry_1 = require("@civ-clone/core-tile-improvement/TileImprovementRegistry");
const TileImprovements_1 = require("@civ-clone/civ2-world/TileImprovements");
const Production_1 = require("@civ-clone/base-terrain-yield-production/Production");
// The providers of the steps OpenCiv2's `city_tile_yield` (richardpenman/civ2@49f26ec) takes after a Wonder's +1 on a
//  square: the railroad's half again (shields only), the government's penalty and bonus, and pollution's halving.
const laterSteps = [governmentTileYield_1.DESPOTISM_PENALTY, governmentTileYield_1.TRADE_BONUS, TileImprovements_1.Pollution.name];
const has = (tile, Improvement, tileImprovementRegistry) => tileImprovementRegistry
    .getByTile(tile)
    .some((improvement) => improvement instanceof Improvement);
/**
 * What a square's `YieldType` comes to from `before` (its yield ahead of the later steps), through those steps, as civ2-
 *  world's square rules and civ2-city-happiness's celebration rule work it out: the railroad's half again for shields,
 *  the government's penalty and bonus (none of the penalty while `celebrating`), then pollution's halving, rounded up.
 */
const throughLaterSteps = (tile, YieldType, before, government, celebrating, tileImprovementRegistry = TileImprovementRegistry_1.instance) => {
    const railroaded = YieldType === Production_1.default && has(tile, TileImprovements_1.Railroad, tileImprovementRegistry)
        ? before + Math.floor(before / 2)
        : before, stepped = (0, governmentTileYield_1.governmentTileYield)(YieldType, railroaded, government, celebrating);
    return has(tile, TileImprovements_1.Pollution, tileImprovementRegistry)
        ? Math.ceil(stepped / 2)
        : stepped;
};
exports.throughLaterSteps = throughLaterSteps;
/**
 * What a square `city` works yields of `YieldType` ahead of the later steps: its yields less those the steps added
 *  (for shields, the railroad's too).
 */
const beforeLaterSteps = (tile, city, YieldType) => {
    const providers = YieldType === Production_1.default ? [...laterSteps, TileImprovements_1.Railroad.name] : laterSteps;
    return tile
        .yields(city.player())
        .filter((tileYield) => tileYield instanceof YieldType)
        .flatMap((tileYield) => tileYield.values())
        .filter(([, provider]) => !providers.includes(provider))
        .reduce((total, [value]) => total + value, 0);
};
exports.beforeLaterSteps = beforeLaterSteps;
/**
 * What a Wonder's +1 on a square's `YieldType` comes to once the later steps have run (OpenCiv2 `city_tile_yield` adds
 *  the Colossus' trade and King Richard's shield before them): under Anarchy or Despotism a square at 2 stays at 2, say.
 *  `applies` says whether the square gets the +1 at all, from its yield ahead of the steps.
 */
const squareBonus = (city, YieldType, government, celebrating, applies, tileImprovementRegistry = TileImprovementRegistry_1.instance) => city
    .tilesWorked()
    .entries()
    .reduce((total, tile) => {
    const before = (0, exports.beforeLaterSteps)(tile, city, YieldType);
    if (!applies(before)) {
        return total;
    }
    return (total +
        (0, exports.throughLaterSteps)(tile, YieldType, before + 1, government, celebrating, tileImprovementRegistry) -
        (0, exports.throughLaterSteps)(tile, YieldType, before, government, celebrating, tileImprovementRegistry));
}, 0);
exports.squareBonus = squareBonus;
exports.default = exports.squareBonus;
//# sourceMappingURL=squareBonus.js.map