import {
  CityBuildRegistry,
  instance as cityBuildRegistryInstance,
} from '@civ-clone/core-city-build/CityBuildRegistry';
import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import {
  Lighthouse,
  MagellansExpedition,
  ManhattanProject,
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
  UnitRegistry,
  instance as unitRegistryInstance,
} from '@civ-clone/core-unit/UnitRegistry';
import BuildPriority from '@civ-clone/core-city-build/Rules/BuildPriority';
import { IBuildable as Buildable } from '@civ-clone/core-city-build/Buildable';
import City from '@civ-clone/core-city/City';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Naval from '@civ-clone/base-unit-type-naval/Naval';
import Production from '@civ-clone/base-terrain-yield-production/Production';
import Unit from '@civ-clone/core-unit/Unit';
import Wonder from '@civ-clone/core-wonder/Wonder';
import Yield from '@civ-clone/core-yield/Yield';
import { isA } from '@civ-clone/core-unit/traits';
import { isObsolete } from '@civ-clone/base-wonder/lib/obsolete';

// How much a city on Auto, or a computer player, wants a Wonder: civ1-wonder's numbers, until the AI's own Wonder
//  choice (`city_choose_production_wonder_bias`) is ported. A little, next to what the city lacks, and only where it
//  makes `wonderShields` or more, the Wonder would do something for its player, and none of the player's other cities
//  is building it already.
export const wonderPriority = 1.5;

export const wonderShields = 5;

// Wonders that only help ships, so do nothing for a player with none.
const forShips: (typeof Wonder)[] = [Lighthouse, MagellansExpedition];

// Wonders that do a player more harm than good: the Manhattan Project lets every player build nuclear weapons.
const neverWanted: (typeof Wonder)[] = [ManhattanProject];

const isWonder = (BuildItem: Buildable): boolean =>
  Object.prototype.isPrototypeOf.call(Wonder, BuildItem);

export const getRules = (
  cityRegistry: CityRegistry = cityRegistryInstance,
  cityBuildRegistry: CityBuildRegistry = cityBuildRegistryInstance,
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance,
  unitRegistry: UnitRegistry = unitRegistryInstance,
  requirementRegistry: RequirementRegistry = requirementRegistryInstance
): BuildPriority[] => [
  new BuildPriority(
    'civ2-wonder:city/build-priority/wonder',
    new Criterion((cityBuild: CityBuild, BuildItem: Buildable): boolean =>
      isWonder(BuildItem)
    ),
    new Criterion(
      (cityBuild: CityBuild, BuildItem: Buildable): boolean =>
        !neverWanted.includes(BuildItem as unknown as typeof Wonder) &&
        !isObsolete(
          BuildItem as unknown as typeof Wonder,
          playerResearchRegistry,
          requirementRegistry
        )
    ),
    new Criterion(
      (cityBuild: CityBuild, BuildItem: Buildable): boolean =>
        !forShips.includes(BuildItem as unknown as typeof Wonder) ||
        unitRegistry
          .getByPlayer(cityBuild.city().player())
          .some((unit: Unit): boolean => isA(unit, Naval))
    ),
    new Criterion(
      (cityBuild: CityBuild, BuildItem: Buildable): boolean =>
        !cityRegistry
          .getByPlayer(cityBuild.city().player())
          .some(
            (city: City): boolean =>
              city !== cityBuild.city() &&
              cityBuildRegistry.getByCity(city).building()?.item() === BuildItem
          )
    ),
    new Criterion(
      (cityBuild: CityBuild, BuildItem: Buildable, yields: Yield[]): boolean =>
        yields
          .filter(
            (cityYield: Yield): boolean => cityYield instanceof Production
          )
          .reduce(
            (total: number, cityYield: Yield): number =>
              total + cityYield.value(),
            0
          ) >= wonderShields
    ),
    new Effect((): number => wonderPriority)
  ),
];

export default getRules;
