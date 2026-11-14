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
import {
  Colossus,
  CureForCancer,
  HangingGardens,
  KingRichardsCrusade,
} from '../../Wonders';
import {
  cityHasWonder,
  playerHasWonder,
} from '@civ-clone/base-wonder/lib/hasWonder';
import City from '@civ-clone/core-city/City';
import CityYield from '@civ-clone/core-city/Rules/Yield';
import Effect from '@civ-clone/core-rule/Effect';
import Happiness from '@civ-clone/base-city-yield-happiness/Happiness';
import Priority from '@civ-clone/core-rule/Priority';
import Production from '@civ-clone/base-terrain-yield-production/Production';
import Tile from '@civ-clone/core-world/Tile';
import Trade from '@civ-clone/base-terrain-yield-trade/Trade';
import Yield from '@civ-clone/core-yield/Yield';

// OpenCiv2 (richardpenman/civ2@49f26ec):
// - `city_tile_yield`: in the Colossus' city each worked square that yields trade (every ocean square, and a land
//   square once its trade isn't 0) yields 1 more; in King Richard's Crusade's city every worked square yields 1 more
//   shield.
// - `city_calc_trade_happiness`: the Hanging Gardens make 1 citizen happy in each of their owner's cities and 2 more in
//   their own; the Cure for Cancer 1 in each of its owner's cities.
// Each Wonder stops once it's obsolete or its city is lost (base-wonder's `cityHasWonder` and `playerHasWonder`).
export const getRules = (
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance,
  wonderRegistry: WonderRegistry = wonderRegistryInstance,
  requirementRegistry: RequirementRegistry = requirementRegistryInstance
): CityYield[] => [
  new CityYield(
    'civ2-wonder:city/yield/colossus',
    new Priority(500),
    cityHasWonder(
      Colossus,
      wonderRegistry,
      playerResearchRegistry,
      requirementRegistry
    ),
    new Effect(
      (city: City): Yield =>
        new Trade(
          city
            .tilesWorked()
            .filter((tile: Tile): boolean =>
              tile
                .yields()
                .some((tileYield: Yield) => tileYield instanceof Trade)
            ).length,
          Colossus.name
        )
    )
  ),

  new CityYield(
    'civ2-wonder:city/yield/king-richards-crusade',
    new Priority(500),
    cityHasWonder(
      KingRichardsCrusade,
      wonderRegistry,
      playerResearchRegistry,
      requirementRegistry
    ),
    new Effect(
      (city: City): Yield =>
        new Production(city.tilesWorked().length, KingRichardsCrusade.name)
    )
  ),

  new CityYield(
    'civ2-wonder:city/yield/hanging-gardens',
    playerHasWonder(
      HangingGardens,
      wonderRegistry,
      playerResearchRegistry,
      requirementRegistry
    ),
    new Effect((): Yield => new Happiness(1, HangingGardens.name))
  ),

  new CityYield(
    'civ2-wonder:city/yield/hanging-gardens-city',
    cityHasWonder(
      HangingGardens,
      wonderRegistry,
      playerResearchRegistry,
      requirementRegistry
    ),
    new Effect((): Yield => new Happiness(2, HangingGardens.name))
  ),

  new CityYield(
    'civ2-wonder:city/yield/cure-for-cancer',
    playerHasWonder(
      CureForCancer,
      wonderRegistry,
      playerResearchRegistry,
      requirementRegistry
    ),
    new Effect((): Yield => new Happiness(1, CureForCancer.name))
  ),
];

export default getRules;
