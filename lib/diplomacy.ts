import {
  EiffelTower,
  ManhattanProject,
  MarcoPolosEmbassy,
  UnitedNations,
} from '../Wonders';
import {
  EIFFEL_TOWER_APPLIED,
  EIFFEL_TOWER_CAPTURED_RULE,
  EIFFEL_TOWER_COMPLETE_RULE,
  MANHATTAN_PROJECT_COMPLETE_RULE,
  EIFFEL_TOWER_CONTACT_RULE,
  MARCO_POLOS_EMBASSY_EMBASSY_RULE,
  UNITED_NATIONS_EMBASSY_RULE,
} from '../RuleIds';
import {
  InteractionRegistry,
  instance as interactionRegistryInstance,
} from '@civ-clone/core-diplomacy/InteractionRegistry';
import {
  PendingEffect,
  PendingEffectRegistry,
  instance as pendingEffectRegistryInstance,
} from '@civ-clone/core-pending-effect';
import {
  PlayerRegistry,
  instance as playerRegistryInstance,
} from '@civ-clone/core-player/PlayerRegistry';
import {
  PlayerResearchRegistry,
  instance as playerResearchRegistryInstance,
} from '@civ-clone/core-science/PlayerResearchRegistry';
import {
  RequirementRegistry,
  instance as requirementRegistryInstance,
} from '@civ-clone/core-requirement/RequirementRegistry';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  Turn,
  instance as turnInstance,
} from '@civ-clone/core-turn-based-game/Turn';
import {
  WonderRegistry,
  instance as wonderRegistryInstance,
} from '@civ-clone/core-wonder/WonderRegistry';
import {
  attitude,
  clearVendettasAgainst,
  reputation,
} from '@civ-clone/civ2-diplomacy/lib/relations';
import {
  cityHasWonder,
  playerOwnsWonder,
} from '@civ-clone/base-wonder/lib/hasWonder';
import { BuildableInstance } from '@civ-clone/core-city-build/Buildable';
import BuildingComplete from '@civ-clone/core-city-build/Rules/BulidingComplete';
import Captured from '@civ-clone/core-city/Rules/Captured';
import City from '@civ-clone/core-city/City';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import HasEmbassy from '@civ-clone/base-diplomacy/Rules/HasEmbassy';
import Player from '@civ-clone/core-player/Player';
import Wonder from '@civ-clone/core-wonder/Wonder';
import isBarbarian from '@civ-clone/base-civilization-barbarian/isBarbarian';
import Contact from '@civ-clone/base-diplomacy-interaction-contact/Contact';
import Created from '@civ-clone/core-diplomacy/Rules/Interaction/Created';
import Interaction from '@civ-clone/core-diplomacy/Interaction';
import Low from '@civ-clone/core-rule/Priorities/Low';

export interface DiplomacyRegistries {
  interactionRegistry?: InteractionRegistry;
  pendingEffectRegistry?: PendingEffectRegistry;
  playerRegistry?: PlayerRegistry;
  playerResearchRegistry?: PlayerResearchRegistry;
  requirementRegistry?: RequirementRegistry;
  ruleRegistry?: RuleRegistry;
  turn?: Turn;
  wonderRegistry?: WonderRegistry;
}

/** The wonders that act as an embassy with every other player, for their owner, with the rule that says so. */
export const embassyWonders: [typeof Wonder, string][] = [
  [MarcoPolosEmbassy, MARCO_POLOS_EMBASSY_EMBASSY_RULE],
  [UnitedNations, UNITED_NATIONS_EMBASSY_RULE],
];

/**
 * The diplomatic parts of Civilization II's wonders that aren't in civ2-diplomacy's own formulas (OpenCiv2,
 *  richardpenman/civ2@e39fe7b). civ2-diplomacy reads who owns Marco Polo's, the Great Wall, the United Nations, the
 *  Eiffel Tower and Magellan's Expedition itself, for the talks, the Senate, patience, reputation's recovery and share
 *  maps. Expired wonders count as absent (base-wonder's `playerOwnsWonder`, with civ2-wonder's expiries in the
 *  requirements).
 * - **Marco Polo's Embassy and the United Nations** act as an embassy with every other player for their owner
 *   (base-diplomacy's `HasEmbassy`; they set no `Embassy`, as the original sets no flag). They make no contact.
 * - **The Eiffel Tower** (`civ_apply_eiffel_tower`, `civ.cpp:6794-6812`), once for each player, when it is built or
 *   captured: its owner's reputation is halved (rounded down), every other player's attitude to it falls by 25, and
 *   every vendetta held against it ends. That it was applied is kept as a `PendingEffect` (`EIFFEL_TOWER_APPLIED`) on
 *   the player, which is never discharged, as the original's `CIVF_EIFFEL_APPLIED`. The original lowers every
 *   civilization's attitude, met or not; here an attitude is seeded when a pair meets (civ2-diplomacy), so a player
 *   that meets the owner later has its seeded attitude to it lowered by 25 then (`EIFFEL_TOWER_CONTACT_RULE`, after
 *   the seeding).
 * - **The Manhattan Project** (`city_production.cpp:2435-2438`), when it is built: every player's reputation becomes
 *   (reputation + 1) / 2, rounded down, at most 6.
 *
 * Barbarians take no part.
 */
export const getRules = ({
  interactionRegistry = interactionRegistryInstance,
  pendingEffectRegistry = pendingEffectRegistryInstance,
  playerRegistry = playerRegistryInstance,
  playerResearchRegistry = playerResearchRegistryInstance,
  requirementRegistry = requirementRegistryInstance,
  ruleRegistry = ruleRegistryInstance,
  turn = turnInstance,
  wonderRegistry = wonderRegistryInstance,
}: DiplomacyRegistries = {}): (
  | HasEmbassy
  | BuildingComplete
  | Captured
  | Created
)[] => {
  const relations = { interactionRegistry, ruleRegistry, turn },
    others = (player: Player): Player[] =>
      playerRegistry
        .entries()
        .filter(
          (other: Player): boolean => other !== player && !isBarbarian(other)
        ),
    applied = (player: Player): boolean =>
      pendingEffectRegistry
        .getByTarget(player)
        .some(
          (pendingEffect: PendingEffect): boolean =>
            pendingEffect.handler() === EIFFEL_TOWER_APPLIED
        ),
    applyEiffelTower = (player: Player): void => {
      if (isBarbarian(player) || applied(player)) {
        return;
      }

      pendingEffectRegistry.register(
        new PendingEffect(EIFFEL_TOWER_APPLIED, player)
      );

      const reputations = reputation(relations),
        attitudes = attitude(relations);

      reputations.set(
        player,
        Math.floor(reputations.get(player) / 2),
        'eiffel-tower'
      );

      others(player).forEach((other: Player): void => {
        // An attitude is seeded when a pair meets (civ2-diplomacy), so only those that have met have one to change.
        if (attitudes.get(other, player) !== undefined) {
          attitudes.adjust(other, player, -25, 'eiffel-tower');
        }
      });

      clearVendettasAgainst(player, interactionRegistry);
    },
    built =
      (WonderType: typeof Wonder) =>
      (cityBuild: CityBuild, item: BuildableInstance): boolean =>
        item instanceof WonderType,
    holds = (WonderType: typeof Wonder) =>
      cityHasWonder(
        WonderType,
        wonderRegistry,
        playerResearchRegistry,
        requirementRegistry
      );

  return [
    ...embassyWonders.map(
      ([WonderType, id]: [typeof Wonder, string]): HasEmbassy =>
        new HasEmbassy(
          id,
          new Effect(
            (player: Player, other: Player): boolean =>
              player !== other &&
              playerOwnsWonder(
                player,
                WonderType,
                wonderRegistry,
                playerResearchRegistry,
                requirementRegistry
              )
          )
        )
    ),

    new BuildingComplete(
      EIFFEL_TOWER_COMPLETE_RULE,
      new Criterion(built(EiffelTower)),
      new Effect((cityBuild: CityBuild): void =>
        applyEiffelTower(cityBuild.city().player())
      )
    ),

    // A pair meeting after the Eiffel Tower's effect was applied to one of them: the other likes it 25 better, as it
    //  would have had their attitudes been kept before they met. `Low`, so after civ2-diplomacy seeds them.
    new Created(
      EIFFEL_TOWER_CONTACT_RULE,
      new Low(),
      new Criterion(
        (interaction: Interaction): boolean => interaction instanceof Contact
      ),
      new Effect((interaction: Interaction): void => {
        const [player, other] = interaction.players();

        if (player === undefined || other === undefined || player === other) {
          return;
        }

        const attitudes = attitude(relations);

        [
          [player, other],
          [other, player],
        ].forEach(([holder, toward]: Player[]): void => {
          if (
            applied(toward) &&
            !isBarbarian(holder) &&
            attitudes.get(holder, toward) !== undefined
          ) {
            attitudes.adjust(holder, toward, -25, 'eiffel-tower');
          }
        });
      })
    ),

    // `city_capture_aftermath` (`city.cpp:4919-4921`): the captor of the Eiffel Tower's city gets its effect, once.
    new Captured(
      EIFFEL_TOWER_CAPTURED_RULE,
      holds(EiffelTower),
      new Effect((city: City, captor: Player): void => applyEiffelTower(captor))
    ),

    new BuildingComplete(
      MANHATTAN_PROJECT_COMPLETE_RULE,
      new Criterion(built(ManhattanProject)),
      new Effect((): void => {
        const reputations = reputation(relations);

        playerRegistry
          .entries()
          .filter((player: Player): boolean => !isBarbarian(player))
          .forEach((player: Player): void => {
            reputations.set(
              player,
              Math.min(
                6,
                Math.max(0, Math.floor((reputations.get(player) + 1) / 2))
              ),
              'manhattan-project'
            );
          });
      })
    ),
  ];
};

export default getRules;
