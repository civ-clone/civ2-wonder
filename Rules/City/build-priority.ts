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
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Yield from '@civ-clone/core-yield/Yield';
import Naval from '@civ-clone/base-unit-type-naval/Naval';
import Production from '@civ-clone/base-terrain-yield-production/Production';
import Unit from '@civ-clone/core-unit/Unit';
import { isA } from '@civ-clone/core-unit/traits';
import { wonderPriorityRules } from '@civ-clone/base-wonder/lib/buildPriority';

/**
 * How much a computer player wants a Wonder: base-wonder's rule with civ1-wonder's numbers, until the AI's own Wonder
 *  choice (OpenCiv2 `city_choose_production_wonder_bias`) is ported. The Lighthouse and Magellan's only help ships; the
 *  Manhattan Project lets every player build nuclear weapons, so is never wanted.
 *
 * Not for a city on Auto: civ2-city ranks those with Civ2's own scores (`city_choose_production_improvement_score`), on
 *  another scale. base-wonder's rule takes no extra criterion, so each is wrapped: the same id and priority, a city not
 *  on Auto, then the rule's own criteria and effect.
 */
export const getRules = (
  cityRegistry: CityRegistry = cityRegistryInstance,
  cityBuildRegistry: CityBuildRegistry = cityBuildRegistryInstance,
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance,
  unitRegistry: UnitRegistry = unitRegistryInstance,
  requirementRegistry: RequirementRegistry = requirementRegistryInstance
): BuildPriority[] =>
  wonderPriorityRules(
    'civ2-wonder',
    {
      Production,
      isShip: (unit: Unit): boolean => isA(unit, Naval),
      forShips: [Lighthouse, MagellansExpedition],
      neverWanted: [ManhattanProject],
    },
    cityRegistry,
    cityBuildRegistry,
    playerResearchRegistry,
    unitRegistry,
    requirementRegistry
  ).map(
    (rule: BuildPriority): BuildPriority =>
      new BuildPriority(
        rule.id() as string,
        rule.priority(),
        new Criterion((cityBuild: CityBuild): boolean => !cityBuild.auto()),
        new Criterion(
          (
            cityBuild: CityBuild,
            BuildItem: Buildable,
            yields: Yield[]
          ): boolean => rule.validate(cityBuild, BuildItem, yields)
        ),
        new Effect(
          (
            cityBuild: CityBuild,
            BuildItem: Buildable,
            yields: Yield[]
          ): number => rule.process(cityBuild, BuildItem, yields) as number
        )
      )
  );

export default getRules;
