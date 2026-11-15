import { CityBuildRegistry } from '@civ-clone/core-city-build/CityBuildRegistry';
import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import { RequirementRegistry } from '@civ-clone/core-requirement/RequirementRegistry';
import { UnitRegistry } from '@civ-clone/core-unit/UnitRegistry';
import BuildPriority from '@civ-clone/core-city-build/Rules/BuildPriority';
/**
 * How much a computer player wants a Wonder: base-wonder's rule with civ1-wonder's numbers, until the AI's own Wonder
 *  choice (OpenCiv2 `city_choose_production_wonder_bias`) is ported. The Lighthouse and Magellan's only help ships; the
 *  Manhattan Project lets every player build nuclear weapons, so is never wanted.
 *
 * Not for a city on Auto: civ2-city ranks those with Civ2's own scores (`city_choose_production_improvement_score`), on
 *  another scale. base-wonder's rule takes no extra criterion, so each is wrapped: the same id and priority, a city not
 *  on Auto, then the rule's own criteria and effect.
 */
export declare const getRules: (
  cityRegistry?: CityRegistry,
  cityBuildRegistry?: CityBuildRegistry,
  playerResearchRegistry?: PlayerResearchRegistry,
  unitRegistry?: UnitRegistry,
  requirementRegistry?: RequirementRegistry
) => BuildPriority[];
export default getRules;
