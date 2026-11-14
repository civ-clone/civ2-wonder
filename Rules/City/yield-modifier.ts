import {
  CityImprovementRegistry,
  instance as cityImprovementRegistryInstance,
} from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import {
  CopernicusObservatory,
  IsaacNewtonsCollege,
  SetiProgram,
} from '../../Wonders';
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
  cityHasImprovement,
  cityHasImprovementOrWonder,
} from '@civ-clone/base-wonder/lib/hasImprovementOrWonder';
import City from '@civ-clone/core-city/City';
import Effect from '@civ-clone/core-rule/Effect';
import Library from '@civ-clone/base-city-improvement-library/Library';
import { Low } from '@civ-clone/core-rule/Priorities';
import Priority from '@civ-clone/core-rule/Priority';
import Research from '@civ-clone/base-city-yield-research/Research';
import ResearchLab from '@civ-clone/base-city-improvement-researchlab/ResearchLab';
import University from '@civ-clone/base-city-improvement-university/University';
import Yield from '@civ-clone/core-yield/Yield';
import YieldModifier from '@civ-clone/core-city/Rules/YieldModifier';
import Criterion from '@civ-clone/core-rule/Criterion';
import { cityHasWonder } from '@civ-clone/base-wonder/lib/hasWonder';
import { reduceYield } from '@civ-clone/core-yield/lib/reduceYields';

export interface YieldModifierRegistries {
  cityImprovementRegistry?: CityImprovementRegistry;
  playerResearchRegistry?: PlayerResearchRegistry;
  requirementRegistry?: RequirementRegistry;
  wonderRegistry?: WonderRegistry;
}

/**
 * How many science buildings `city` counts (OpenCiv2 `city_split_trade`, richardpenman/civ2@49f26ec): a Library, a
 *  University, and a Research Lab or the SETI Program (one test: civ2-city-improvement owns that site).
 */
export const scienceBuildings = (
  city: City,
  {
    cityImprovementRegistry = cityImprovementRegistryInstance,
    playerResearchRegistry = playerResearchRegistryInstance,
    requirementRegistry = requirementRegistryInstance,
    wonderRegistry = wonderRegistryInstance,
  }: YieldModifierRegistries = {}
): number =>
  [Library, University].filter((Improvement) =>
    cityHasImprovement(city, Improvement, cityImprovementRegistry)
  ).length +
  (cityHasImprovementOrWonder(city, ResearchLab, SetiProgram, {
    cityImprovementRegistry,
    playerResearchRegistry,
    requirementRegistry,
    wonderRegistry,
  })
    ? 1
    : 0);

/**
 * Isaac Newton's College's share of its city's science: Civilization II adds the city's base science times its science
 *  buildings, halved (`city_split_trade`) except in Newton's city. So the college adds what the halving takes away,
 *  `base × buildings − ⌊base × buildings / 2⌋`, on top of the buildings' own half each (civ2-city-improvement's).
 */
export const newtonsShare = (base: number, buildings: number): number =>
  base * buildings - Math.floor((base * buildings) / 2);

// OpenCiv2 `city_split_trade` (richardpenman/civ2@49f26ec): Isaac Newton's College doubles its city's science
//  buildings' bonus; then the Copernicus Observatory doubles its city's science, after every other bonus.
export const getRules = ({
  cityImprovementRegistry = cityImprovementRegistryInstance,
  playerResearchRegistry = playerResearchRegistryInstance,
  requirementRegistry = requirementRegistryInstance,
  wonderRegistry = wonderRegistryInstance,
}: YieldModifierRegistries = {}): YieldModifier[] => {
  const registries = {
    cityImprovementRegistry,
    playerResearchRegistry,
    requirementRegistry,
    wonderRegistry,
  };

  return [
    new YieldModifier(
      'civ2-wonder:city/yield-modifier/isaac-newtons-college',
      new Low(),
      cityHasWonder(
        IsaacNewtonsCollege,
        wonderRegistry,
        playerResearchRegistry,
        requirementRegistry
      ),
      new Criterion(
        (city: City): boolean => scienceBuildings(city, registries) > 0
      ),
      new Effect(
        (city: City, yields: Yield[], base: Yield[]): Yield =>
          new Research(
            newtonsShare(
              reduceYield(base, Research),
              scienceBuildings(city, registries)
            ),
            IsaacNewtonsCollege.name
          )
      )
    ),

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
            reduceYield(yields, Research),
            CopernicusObservatory.name
          )
      )
    ),
  ];
};

export default getRules;
