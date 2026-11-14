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
import Naval from '@civ-clone/base-unit-type-naval/Naval';
import Production from '@civ-clone/base-terrain-yield-production/Production';
import Unit from '@civ-clone/core-unit/Unit';
import { isA } from '@civ-clone/core-unit/traits';
import { wonderPriorityRules } from '@civ-clone/base-wonder/lib/buildPriority';

/**
 * How much a city on Auto, or a computer player, wants a Wonder: base-wonder's rule with civ1-wonder's numbers, until
 *  the AI's own Wonder choice (OpenCiv2 `city_choose_production_wonder_bias`) is ported. The Lighthouse and Magellan's
 *  only help ships; the Manhattan Project lets every player build nuclear weapons, so is never wanted.
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
  );

export default getRules;
