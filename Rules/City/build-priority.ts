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
import { ClientRegistry } from '@civ-clone/core-client/ClientRegistry';
import { PlayerRegistry } from '@civ-clone/core-player/PlayerRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { TraitRegistry } from '@civ-clone/core-civilization/TraitRegistry';
import Aggressive from '@civ-clone/base-leader-trait-aggression/Aggression/Aggressive';
import Civilized from '@civ-clone/base-leader-trait-militarism/Militarism/Civilized';
import Militaristic from '@civ-clone/base-leader-trait-militarism/Militarism/Militaristic';
import BuildPriority from '@civ-clone/core-city-build/Rules/BuildPriority';
import Player from '@civ-clone/core-player/Player';
import Rocketry from '@civ-clone/base-science-advance-rocketry/Rocketry';
import Trait from '@civ-clone/core-civilization/Trait';
import isHuman from '@civ-clone/base-difficulty/lib/isHuman';
import leaderTraits from '@civ-clone/base-leader-personality/lib/leaderTraits';
import { militaryPower } from '@civ-clone/core-power/lib/strength';
import { IBuildable as Buildable } from '@civ-clone/core-city-build/Buildable';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Yield from '@civ-clone/core-yield/Yield';
import Naval from '@civ-clone/base-unit-type-naval/Naval';
import Production from '@civ-clone/base-terrain-yield-production/Production';
import Unit from '@civ-clone/core-unit/Unit';
import { isA } from '@civ-clone/core-unit/traits';
import {
  wonderPriority,
  wonderPriorityRules,
} from '@civ-clone/base-wonder/lib/buildPriority';

/**
 * How much a computer player wants a Wonder: base-wonder's rule with civ1-wonder's numbers, until the AI's own Wonder
 *  choice (OpenCiv2 `city_choose_production_wonder_bias`) is ported. The Lighthouse and Magellan's only help ships; the
 *  Manhattan Project is wanted only where `manhattanProjectRules` says (an aggressive leader's).
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
      // The Manhattan Project is for `manhattanProjectRules` to say.
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

// Below anything a computer player's city would build: what `manhattanProjectRules` gives the Manhattan Project for a
//  player that doesn't want it, so that it isn't built at all.
export const NEVER_WANTED = -1000;

// What `manhattanProjectRules` adds for a player that wants the Manhattan Project, by its leader's civilize attitude
//  (militaristic −1, normal 0, civilized 1): the original adds `civilize × 2 − attack` to its score (lowest wanted
//  most), so an aggressive (attack 1) leader's is 3 better than a plain Wonder's when militaristic, 1 better when
//  normal and 1 worse when civilized. Here that's half a Wonder priority for each point: 2.25, 0.75 and −0.75, on top of
//  the Wonder priority's 1.5.
export const manhattanProjectBias = (civilize: number): number =>
  (wonderPriority * (1 - 2 * civilize)) / 2;

export interface ManhattanProjectDependencies {
  clientRegistry: ClientRegistry;
  playerRegistry: PlayerRegistry;
  playerResearchRegistry: PlayerResearchRegistry;
  ruleRegistry: RuleRegistry;
  traitRegistry: TraitRegistry;
  unitRegistry: UnitRegistry;
}

/**
 * Whether a computer player wants the Manhattan Project, which lets every player build nuclear weapons: its leader's
 *  attack attitude is aggressive, it knows Rocketry, and no person who knows Rocketry is weaker than
 *  it (OpenCiv2 `city_choose_production_wonder_bias`, `city_production.cpp:1240-1263`, where a weaker person with
 *  Rocketry rules it out). The original scores it for any leader; here only an aggressive leader wants it at all.
 *  Strength is base's `militaryPower` (attack and defence of all the player's units), not the original's stored
 *  military strength. The original also wants it more while the strongest player is a person (more again if that
 *  person doesn't know Rocketry); that isn't here.
 */
// The leader's civilize attitude: −1 militaristic, 1 civilized, 0 otherwise.
const civilizeOf = (traitRegistry: TraitRegistry, player: Player): number => {
  const traits = leaderTraits(traitRegistry, player);

  return traits.some((trait: Trait): boolean => trait instanceof Militaristic)
    ? -1
    : traits.some((trait: Trait): boolean => trait instanceof Civilized)
    ? 1
    : 0;
};

export const wantsManhattanProject = (
  {
    clientRegistry,
    playerRegistry,
    playerResearchRegistry,
    ruleRegistry,
    traitRegistry,
    unitRegistry,
  }: ManhattanProjectDependencies,
  player: Player
): boolean => {
  const knowsRocketry = (other: Player): boolean =>
      playerResearchRegistry.getByPlayer(other).completed(Rocketry),
    power = (other: Player): number =>
      militaryPower(unitRegistry.getByPlayer(other), ruleRegistry);
  let own: number | null = null;

  return (
    leaderTraits(traitRegistry, player).some(
      (trait: Trait): boolean => trait instanceof Aggressive
    ) &&
    knowsRocketry(player) &&
    !playerRegistry.entries().some(
      (other: Player): boolean =>
        other !== player &&
        isHuman(other, clientRegistry) &&
        // A person still in the game: one destroyed has no units, and would always count as weaker.
        unitRegistry.getByPlayer(other).length > 0 &&
        knowsRocketry(other) &&
        power(other) < (own ??= power(player))
    )
  );
};

/**
 * `civ2-wonder:city/build-priority/manhattan-project`: for a city not on Auto, the Manhattan Project scores
 *  `NEVER_WANTED` for a player that doesn't want it (`wantsManhattanProject`), and `manhattanProjectBias` for one that
 *  does. The bias stands on its own: `getRules`' Wonder priority adds 1.5 where its own criteria hold (the city makes 5
 *  shields or more, and no other city of the player's is building it), and doesn't where they don't.
 */
export const manhattanProjectRules = (
  dependencies: ManhattanProjectDependencies
): BuildPriority[] => [
  new BuildPriority(
    'civ2-wonder:city/build-priority/manhattan-project',
    new Criterion((cityBuild: CityBuild): boolean => !cityBuild.auto()),
    new Criterion(
      (cityBuild: CityBuild, BuildItem: Buildable): boolean =>
        (BuildItem as unknown) === ManhattanProject
    ),
    new Effect((cityBuild: CityBuild): number => {
      const player = cityBuild.city().player();

      return wantsManhattanProject(dependencies, player)
        ? manhattanProjectBias(civilizeOf(dependencies.traitRegistry, player))
        : NEVER_WANTED;
    })
  ),
];

export default getRules;
