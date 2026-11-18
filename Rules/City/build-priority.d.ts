import { CityBuildRegistry } from '@civ-clone/core-city-build/CityBuildRegistry';
import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import { RequirementRegistry } from '@civ-clone/core-requirement/RequirementRegistry';
import { UnitRegistry } from '@civ-clone/core-unit/UnitRegistry';
import { ClientRegistry } from '@civ-clone/core-client/ClientRegistry';
import { PlayerRegistry } from '@civ-clone/core-player/PlayerRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { TraitRegistry } from '@civ-clone/core-civilization/TraitRegistry';
import BuildPriority from '@civ-clone/core-city-build/Rules/BuildPriority';
import Player from '@civ-clone/core-player/Player';
/**
 * How much a computer player wants a Wonder: base-wonder's rule with civ1-wonder's numbers, until the AI's own Wonder
 *  choice (OpenCiv2 `city_choose_production_wonder_bias`) is ported. The Lighthouse and Magellan's only help ships; the
 *  Manhattan Project is wanted only where `manhattanProjectRules` says (an aggressive leader's).
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
export declare const NEVER_WANTED = -1000;
export declare const manhattanProjectBias: (civilize: number) => number;
export interface ManhattanProjectDependencies {
  clientRegistry: ClientRegistry;
  playerRegistry: PlayerRegistry;
  playerResearchRegistry: PlayerResearchRegistry;
  ruleRegistry: RuleRegistry;
  traitRegistry: TraitRegistry;
  unitRegistry: UnitRegistry;
}
export declare const wantsManhattanProject: (
  {
    clientRegistry,
    playerRegistry,
    playerResearchRegistry,
    ruleRegistry,
    traitRegistry,
    unitRegistry,
  }: ManhattanProjectDependencies,
  player: Player
) => boolean;
/**
 * `civ2-wonder:city/build-priority/manhattan-project`: for a city not on Auto, the Manhattan Project scores
 *  `NEVER_WANTED` for a player that doesn't want it (`wantsManhattanProject`), and `manhattanProjectBias` for one that
 *  does. The bias stands on its own: `getRules`' Wonder priority adds 1.5 where its own criteria hold (the city makes 5
 *  shields or more, and no other city of the player's is building it), and doesn't where they don't.
 */
export declare const manhattanProjectRules: (
  dependencies: ManhattanProjectDependencies
) => BuildPriority[];
export default getRules;
