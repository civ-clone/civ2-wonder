import { CopernicusObservatory } from '../../Wonders';
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
import Description from '@civ-clone/core-rule/Description';
import Effect from '@civ-clone/core-rule/Effect';
import Priority from '@civ-clone/core-rule/Priority';
import Research from '@civ-clone/base-city-yield-research/Research';
import Yield from '@civ-clone/core-yield/Yield';
import YieldModifier from '@civ-clone/core-city/Rules/YieldModifier';
import { cityHasWonder } from '@civ-clone/base-wonder/lib/hasWonder';
import { reduceYield } from '@civ-clone/core-yield/lib/reduceYields';

export interface YieldModifierRegistries {
  playerResearchRegistry?: PlayerResearchRegistry;
  requirementRegistry?: RequirementRegistry;
  wonderRegistry?: WonderRegistry;
}

// OpenCiv2 `city_split_trade` (richardpenman/civ2@49f26ec): the Copernicus Observatory doubles its city's science,
//  after every other bonus (`X Low`). Isaac Newton's College is part of the science buildings' bonus, which is
//  civ2-city-improvement's (`lib/bonus`), so it isn't here.
/** The share of its city's science the Copernicus Observatory adds, of the total so far: all of it again. */
export const copernicusShare: number = 1;

export const getRules = ({
  playerResearchRegistry = playerResearchRegistryInstance,
  requirementRegistry = requirementRegistryInstance,
  wonderRegistry = wonderRegistryInstance,
}: YieldModifierRegistries = {}): YieldModifier[] => [
  new YieldModifier(
    'civ2-wonder:city/yield-modifier/copernicus-observatory',
    new Priority(4000), // X Low: after every `Low` modifier
    cityHasWonder(
      CopernicusObservatory,
      wonderRegistry,
      playerResearchRegistry,
      requirementRegistry
    ),
    new Effect(
      (city: City, yields: Yield[]): Yield =>
        new Research(
          reduceYield(yields, Research) * copernicusShare,
          CopernicusObservatory.name
        )
    ),
    new Description({
      type: 'yield_percent',
      subject: CopernicusObservatory,
      yield: Research,
      value: copernicusShare,
      of: 'total',
    })
  ),
];

export default getRules;
