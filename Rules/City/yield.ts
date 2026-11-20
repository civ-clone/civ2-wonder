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
import Description from '@civ-clone/core-rule/Description';
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
// The citizens each Wonder makes happy, read by its rule and by what the rule says it does (civ-clone/web-renderer#1196).
export const hangingGardensHappy: number = 1,
  hangingGardensCityHappy: number = 2,
  cureForCancerHappy: number = 1;

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
    new Effect(
      (): Yield => new Happiness(hangingGardensHappy, HangingGardens.name)
    ),
    new Description({
      type: 'happy',
      subject: HangingGardens,
      value: hangingGardensHappy,
      scope: 'player',
    })
  ),

  new CityYield(
    'civ2-wonder:city/yield/hanging-gardens-city',
    cityHasWonder(
      HangingGardens,
      wonderRegistry,
      playerResearchRegistry,
      requirementRegistry
    ),
    new Effect(
      (): Yield => new Happiness(hangingGardensCityHappy, HangingGardens.name)
    ),
    new Description({
      type: 'happy',
      subject: HangingGardens,
      value: hangingGardensCityHappy,
      step: 'more',
    })
  ),

  new CityYield(
    'civ2-wonder:city/yield/cure-for-cancer',
    playerHasWonder(
      CureForCancer,
      wonderRegistry,
      playerResearchRegistry,
      requirementRegistry
    ),
    new Effect(
      (): Yield => new Happiness(cureForCancerHappy, CureForCancer.name)
    ),
    new Description({
      type: 'happy',
      subject: CureForCancer,
      value: cureForCancerHappy,
      scope: 'player',
    })
  ),
];

export default getRules;
