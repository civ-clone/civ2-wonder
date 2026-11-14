import { TileImprovementRegistry } from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import City from '@civ-clone/core-city/City';
import PlayerGovernment from '@civ-clone/core-government/PlayerGovernment';
import Tile from '@civ-clone/core-world/Tile';
import Yield from '@civ-clone/core-yield/Yield';
/**
 * What a square's `YieldType` comes to from `before` (its yield ahead of the later steps), through those steps, as civ2-
 *  world's square rules and civ2-city-happiness's celebration rule work it out: the railroad's half again for shields,
 *  the government's penalty and bonus (none of the penalty while `celebrating`), then pollution's halving, rounded up.
 */
export declare const throughLaterSteps: (
  tile: Tile,
  YieldType: typeof Yield,
  before: number,
  government: PlayerGovernment | null,
  celebrating: boolean,
  tileImprovementRegistry?: TileImprovementRegistry
) => number;
/**
 * What a square `city` works yields of `YieldType` ahead of the later steps: its yields less those the steps added
 *  (for shields, the railroad's too).
 */
export declare const beforeLaterSteps: (
  tile: Tile,
  city: City,
  YieldType: typeof Yield
) => number;
/**
 * What a Wonder's +1 on a square's `YieldType` comes to once the later steps have run (OpenCiv2 `city_tile_yield` adds
 *  the Colossus' trade and King Richard's shield before them): under Anarchy or Despotism a square at 2 stays at 2, say.
 *  `applies` says whether the square gets the +1 at all, from its yield ahead of the steps.
 */
export declare const squareBonus: (
  city: City,
  YieldType: typeof Yield,
  government: PlayerGovernment | null,
  celebrating: boolean,
  applies: (before: number) => boolean,
  tileImprovementRegistry?: TileImprovementRegistry
) => number;
export default squareBonus;
