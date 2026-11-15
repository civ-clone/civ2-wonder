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
import { CureForCancer, HangingGardens } from '../../Wonders';
import {
  cityHasWonder,
  playerHasWonder,
} from '@civ-clone/base-wonder/lib/hasWonder';
import CityYield from '@civ-clone/core-city/Rules/Yield';
import Effect from '@civ-clone/core-rule/Effect';
import Happiness from '@civ-clone/base-city-yield-happiness/Happiness';
import Yield from '@civ-clone/core-yield/Yield';

export interface CityYieldRegistries {
  playerResearchRegistry?: PlayerResearchRegistry;
  requirementRegistry?: RequirementRegistry;
  wonderRegistry?: WonderRegistry;
}

// OpenCiv2 `city_calc_trade_happiness` (richardpenman/civ2@49f26ec): the Hanging Gardens make 1 citizen happy in each
//  of their owner's cities and 2 more in their own; the Cure for Cancer 1 in each of its owner's cities. Each Wonder
//  stops once it's obsolete or its city is lost (base-wonder's `cityHasWonder` and `playerHasWonder`). The Colossus and
//  King Richard's Crusade work per square (`Rules/City/tile-yield`).
export const getRules = ({
  playerResearchRegistry = playerResearchRegistryInstance,
  requirementRegistry = requirementRegistryInstance,
  wonderRegistry = wonderRegistryInstance,
}: CityYieldRegistries = {}): CityYield[] => [
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
