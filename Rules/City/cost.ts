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
import { JsBachsCathedral, ShakespearesTheatre } from '../../Wonders';
import {
  cityHasWonder,
  playerHasWonder,
} from '@civ-clone/base-wonder/lib/hasWonder';
import City from '@civ-clone/core-city/City';
import Cost from '@civ-clone/core-city/Rules/Cost';
import Effect from '@civ-clone/core-rule/Effect';
import Priority from '@civ-clone/core-rule/Priority';
import Unhappiness from '@civ-clone/base-city-yield-unhappiness/Unhappiness';
import Yield from '@civ-clone/core-yield/Yield';
import { reduceYield } from '@civ-clone/core-yield/lib/reduceYields';

// OpenCiv2 `city_calc_trade_happiness` (richardpenman/civ2@49f26ec), stage 4, after the government's units (which
//  civ2-city-happiness applies at 3500): in Shakespeare's Theatre's city no citizen is unhappy; in each of J. S.
//  Bach's Cathedral's owner's cities 2 fewer are (every city, not only its continent's, as Civ1's).
export const getRules = (
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance,
  wonderRegistry: WonderRegistry = wonderRegistryInstance,
  requirementRegistry: RequirementRegistry = requirementRegistryInstance
): Cost[] => [
  new Cost(
    'civ2-wonder:city/cost/shakespeares-theatre',
    new Priority(4000),
    cityHasWonder(
      ShakespearesTheatre,
      wonderRegistry,
      playerResearchRegistry,
      requirementRegistry
    ),
    new Effect(
      (city: City, yields: Yield[]): Yield =>
        new Unhappiness(
          -Math.max(0, reduceYield(yields, Unhappiness)),
          ShakespearesTheatre.name
        )
    )
  ),

  new Cost(
    'civ2-wonder:city/cost/js-bachs-cathedral',
    new Priority(4000),
    playerHasWonder(
      JsBachsCathedral,
      wonderRegistry,
      playerResearchRegistry,
      requirementRegistry
    ),
    new Effect(
      (city: City, yields: Yield[]): Yield =>
        new Unhappiness(
          -Math.max(0, Math.min(2, reduceYield(yields, Unhappiness))),
          JsBachsCathedral.name
        )
    )
  ),
];

export default getRules;
