import { CityImprovementRegistry } from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import { RequirementRegistry } from '@civ-clone/core-requirement/RequirementRegistry';
import { WonderRegistry } from '@civ-clone/core-wonder/WonderRegistry';
import City from '@civ-clone/core-city/City';
import YieldModifier from '@civ-clone/core-city/Rules/YieldModifier';
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
export declare const scienceBuildings: (
  city: City,
  {
    cityImprovementRegistry,
    playerResearchRegistry,
    requirementRegistry,
    wonderRegistry,
  }?: YieldModifierRegistries
) => number;
/**
 * Isaac Newton's College's share of its city's science: Civilization II adds the city's base science times its science
 *  buildings, halved (`city_split_trade`) except in Newton's city. So the college adds what the halving takes away,
 *  `base × buildings − ⌊base × buildings / 2⌋`, on top of the buildings' own half each (civ2-city-improvement's).
 */
export declare const newtonsShare: (base: number, buildings: number) => number;
export declare const getRules: ({
  cityImprovementRegistry,
  playerResearchRegistry,
  requirementRegistry,
  wonderRegistry,
}?: YieldModifierRegistries) => YieldModifier[];
export default getRules;
