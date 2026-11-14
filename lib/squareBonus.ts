import {
  DESPOTISM_PENALTY,
  TRADE_BONUS,
  governmentTileYield,
} from '@civ-clone/civ2-world/lib/governmentTileYield';
import {
  TileImprovementRegistry,
  instance as tileImprovementRegistryInstance,
} from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import { Pollution, Railroad } from '@civ-clone/civ2-world/TileImprovements';
import City from '@civ-clone/core-city/City';
import PlayerGovernment from '@civ-clone/core-government/PlayerGovernment';
import Production from '@civ-clone/base-terrain-yield-production/Production';
import Tile from '@civ-clone/core-world/Tile';
import TileImprovement from '@civ-clone/core-tile-improvement/TileImprovement';
import Yield from '@civ-clone/core-yield/Yield';

// The providers of the steps OpenCiv2's `city_tile_yield` (richardpenman/civ2@49f26ec) takes after a Wonder's +1 on a
//  square: the railroad's half again (shields only), the government's penalty and bonus, and pollution's halving.
const laterSteps = [DESPOTISM_PENALTY, TRADE_BONUS, Pollution.name];

const has = (
  tile: Tile,
  Improvement: typeof TileImprovement,
  tileImprovementRegistry: TileImprovementRegistry
): boolean =>
  tileImprovementRegistry
    .getByTile(tile)
    .some(
      (improvement: TileImprovement): boolean =>
        improvement instanceof Improvement
    );

/**
 * What a square's `YieldType` comes to from `before` (its yield ahead of the later steps), through those steps, as civ2-
 *  world's square rules and civ2-city-happiness's celebration rule work it out: the railroad's half again for shields,
 *  the government's penalty and bonus (none of the penalty while `celebrating`), then pollution's halving, rounded up.
 */
export const throughLaterSteps = (
  tile: Tile,
  YieldType: typeof Yield,
  before: number,
  government: PlayerGovernment | null,
  celebrating: boolean,
  tileImprovementRegistry: TileImprovementRegistry = tileImprovementRegistryInstance
): number => {
  const railroaded =
      YieldType === Production && has(tile, Railroad, tileImprovementRegistry)
        ? before + Math.floor(before / 2)
        : before,
    stepped = governmentTileYield(
      YieldType,
      railroaded,
      government,
      celebrating
    );

  return has(tile, Pollution, tileImprovementRegistry)
    ? Math.ceil(stepped / 2)
    : stepped;
};

/**
 * What a square `city` works yields of `YieldType` ahead of the later steps: its yields less those the steps added
 *  (for shields, the railroad's too).
 */
export const beforeLaterSteps = (
  tile: Tile,
  city: City,
  YieldType: typeof Yield
): number => {
  const providers =
    YieldType === Production ? [...laterSteps, Railroad.name] : laterSteps;

  return tile
    .yields(city.player())
    .filter((tileYield: Yield): boolean => tileYield instanceof YieldType)
    .flatMap((tileYield: Yield) => tileYield.values())
    .filter(([, provider]) => !providers.includes(provider))
    .reduce((total: number, [value]) => total + value, 0);
};

/**
 * What a Wonder's +1 on a square's `YieldType` comes to once the later steps have run (OpenCiv2 `city_tile_yield` adds
 *  the Colossus' trade and King Richard's shield before them): under Anarchy or Despotism a square at 2 stays at 2, say.
 *  `applies` says whether the square gets the +1 at all, from its yield ahead of the steps.
 */
export const squareBonus = (
  city: City,
  YieldType: typeof Yield,
  government: PlayerGovernment | null,
  celebrating: boolean,
  applies: (before: number) => boolean,
  tileImprovementRegistry: TileImprovementRegistry = tileImprovementRegistryInstance
): number =>
  city
    .tilesWorked()
    .entries()
    .reduce((total: number, tile: Tile): number => {
      const before = beforeLaterSteps(tile, city, YieldType);

      if (!applies(before)) {
        return total;
      }

      return (
        total +
        throughLaterSteps(
          tile,
          YieldType,
          before + 1,
          government,
          celebrating,
          tileImprovementRegistry
        ) -
        throughLaterSteps(
          tile,
          YieldType,
          before,
          government,
          celebrating,
          tileImprovementRegistry
        )
      );
    }, 0);

export default squareBonus;
