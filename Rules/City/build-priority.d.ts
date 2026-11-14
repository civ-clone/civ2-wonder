import { CityBuildRegistry } from '@civ-clone/core-city-build/CityBuildRegistry';
import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import { RequirementRegistry } from '@civ-clone/core-requirement/RequirementRegistry';
import { UnitRegistry } from '@civ-clone/core-unit/UnitRegistry';
import BuildPriority from '@civ-clone/core-city-build/Rules/BuildPriority';
/**
 * How much a city on Auto, or a computer player, wants a Wonder: base-wonder's rule with civ1-wonder's numbers, until
 *  the AI's own Wonder choice (OpenCiv2 `city_choose_production_wonder_bias`) is ported. The Lighthouse and Magellan's
 *  only help ships; the Manhattan Project lets every player build nuclear weapons, so is never wanted.
 */
export declare const getRules: (
  cityRegistry?: CityRegistry,
  cityBuildRegistry?: CityBuildRegistry,
  playerResearchRegistry?: PlayerResearchRegistry,
  unitRegistry?: UnitRegistry,
  requirementRegistry?: RequirementRegistry
) => BuildPriority[];
export default getRules;
