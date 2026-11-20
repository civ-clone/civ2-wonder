import { Colossus, KingRichardsCrusade } from '../../Wonders';
import {
  PlayerResearchRegistry,
  instance as playerResearchRegistryInstance,
} from '@civ-clone/core-science/PlayerResearchRegistry';
import {
  RequirementRegistry,
  instance as requirementRegistryInstance,
} from '@civ-clone/core-requirement/RequirementRegistry';
import {
  WonderRegistry,
  instance as wonderRegistryInstance,
} from '@civ-clone/core-wonder/WonderRegistry';
import City from '@civ-clone/core-city/City';
import CityTileYield from '@civ-clone/core-city/Rules/CityTileYield';
import Criterion from '@civ-clone/core-rule/Criterion';
import Description from '@civ-clone/core-rule/Description';
import Effect from '@civ-clone/core-rule/Effect';
import Production from '@civ-clone/base-terrain-yield-production/Production';
import Tile from '@civ-clone/core-world/Tile';
import Trade from '@civ-clone/base-terrain-yield-trade/Trade';
import Yield from '@civ-clone/core-yield/Yield';
import { cityHasWonder } from '@civ-clone/base-wonder/lib/hasWonder';
import { tileYieldPriority } from '@civ-clone/civ2-city/lib/tileYieldPipeline';

export interface CityTileYieldRegistries {
  playerResearchRegistry?: PlayerResearchRegistry;
  requirementRegistry?: RequirementRegistry;
  wonderRegistry?: WonderRegistry;
}

/** What `yields` add up to of `YieldType`, at this step. */
const totalOf = (yields: Yield[], YieldType: typeof Yield): number =>
  yields
    .filter((tileYield: Yield): boolean => tileYield instanceof YieldType)
    .reduce(
      (total: number, tileYield: Yield): number => total + tileYield.value(),
      0
    );

// The Colossus and King Richard's Crusade on each square their city works, as steps of OpenCiv2 `city_tile_yield`
//  (`src/auto/city.cpp`, richardpenman/civ2@49f26ec), at civ2-city's priorities for those steps, so the railroad, the
//  government's penalty and bonus, Superhighways and pollution that follow see them (`lib/tileYieldPipeline`):
// - line 2841, `colossusOcean`: an ocean square gives 1 more trade in the Colossus' city, whatever its trade;
// - line 2890, `colossusLand`: a land square that gives any trade by then (after its river and road) gives 1 more;
// - line 2894, `kingRichards`: every square, ocean too, gives 1 more shield in King Richard's Crusade's city.
// `wonder_get_city` answers no city once a Wonder has expired (`wonder_is_expired`), as `cityHasWonder` does.
// What each Wonder adds to a square, read by its rules and by what they say they do (civ-clone/web-renderer#1196).
export const colossusTrade: number = 1,
  kingRichardsProduction: number = 1;

export const getRules = ({
  playerResearchRegistry = playerResearchRegistryInstance,
  requirementRegistry = requirementRegistryInstance,
  wonderRegistry = wonderRegistryInstance,
}: CityTileYieldRegistries = {}): CityTileYield[] => {
  const hasColossus = cityHasWonder(
      Colossus,
      wonderRegistry,
      playerResearchRegistry,
      requirementRegistry
    ),
    hasKingRichards = cityHasWonder(
      KingRichardsCrusade,
      wonderRegistry,
      playerResearchRegistry,
      requirementRegistry
    );

  return [
    new CityTileYield(
      'civ2-wonder:city/tile-yield/colossus-ocean',
      tileYieldPriority('colossusOcean'),
      new Criterion((city: City, tile: Tile): boolean => tile.isWater()),
      hasColossus,
      new Effect((city: City, tile: Tile, yields: Yield[]): void => {
        yields.push(new Trade(colossusTrade, Colossus.name));
      }),
      new Description({
        type: 'tile_yield',
        subject: Colossus,
        yield: Trade,
        value: colossusTrade,
        on: 'ocean',
      })
    ),

    new CityTileYield(
      'civ2-wonder:city/tile-yield/colossus-land',
      tileYieldPriority('colossusLand'),
      new Criterion((city: City, tile: Tile): boolean => tile.isLand()),
      new Criterion(
        (city: City, tile: Tile, yields: Yield[]): boolean =>
          totalOf(yields, Trade) !== 0
      ),
      hasColossus,
      new Effect((city: City, tile: Tile, yields: Yield[]): void => {
        yields.push(new Trade(colossusTrade, Colossus.name));
      }),
      new Description({
        type: 'tile_yield',
        subject: Colossus,
        yield: Trade,
        value: colossusTrade,
        on: 'land_producing',
      })
    ),

    new CityTileYield(
      'civ2-wonder:city/tile-yield/king-richards-crusade',
      tileYieldPriority('kingRichards'),
      hasKingRichards,
      new Effect((city: City, tile: Tile, yields: Yield[]): void => {
        yields.push(
          new Production(kingRichardsProduction, KingRichardsCrusade.name)
        );
      }),
      new Description({
        type: 'tile_yield',
        subject: KingRichardsCrusade,
        yield: Production,
        value: kingRichardsProduction,
      })
    ),
  ];
};

export default getRules;
