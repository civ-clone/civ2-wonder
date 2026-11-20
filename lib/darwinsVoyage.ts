import {
  PendingEffect,
  PendingEffectRegistry,
  instance as pendingEffectRegistryInstance,
} from '@civ-clone/core-pending-effect';
import {
  PlayerResearchRegistry,
  instance as playerResearchRegistryInstance,
} from '@civ-clone/core-science/PlayerResearchRegistry';
import Advance from '@civ-clone/core-science/Advance';
import { BuildableInstance } from '@civ-clone/core-city-build/Buildable';
import BuildingComplete from '@civ-clone/core-city-build/Rules/BulidingComplete';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import Criterion from '@civ-clone/core-rule/Criterion';
import Description from '@civ-clone/core-rule/Description';
import { DARWINS_VOYAGE } from '../RuleIds';
import { DarwinsVoyage } from '../Wonders';
import Effect from '@civ-clone/core-rule/Effect';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import Started from '@civ-clone/core-science/Rules/Started';

// Darwin's Voyage: OpenCiv2 `city_process_production_complete_improvement` (`src/auto/city_production.cpp`,
//  richardpenman/civ2@49f26ec) calls `civ_research_complete` twice. Each call gives the player what they're
//  researching, choosing it first if they aren't researching anything, and sets `research_progress` to 0, so whatever
//  was saved towards it is spent and none carries over. base-wonder's free completions add a whole cost instead, which
//  keeps the progress; these keep the original's.
//
// The choice the original makes there and then (`civ_choose_research`, the human's dialog or the computer's pick)
//  can't happen inside a city's production here: a completion owed to a player researching nothing waits, saved as a
//  `PendingEffect` under `DARWINS_VOYAGE`, until they next choose, and is spent at once then.

/** The research Darwin's Voyage completes, read by its rule and by what it says it does (civ-clone/web-renderer#1196). */
export const DARWINS_VOYAGE_ADVANCES: number = 2;

/** `civ_research_complete`: the advance being researched is given, and the progress towards research is 0 after. */
export const completeResearch = (playerResearch: PlayerResearch): void => {
  playerResearch.progress().set(playerResearch.cost().value());
  playerResearch.check();
};

const spend = (
  playerResearch: PlayerResearch,
  pendingEffect: PendingEffect,
  pendingEffects: PendingEffectRegistry
): void => {
  const remaining = Number(pendingEffect.data().remaining);

  if (remaining <= 1) {
    // The handler (below) completes it.
    pendingEffects.discharge(pendingEffect);

    return;
  }

  pendingEffect.setData({ remaining: String(remaining - 1) });
  completeResearch(playerResearch);
};

const owed = (
  playerResearch: PlayerResearch,
  pendingEffects: PendingEffectRegistry
): PendingEffect[] =>
  pendingEffects
    .getByTarget(playerResearch)
    .filter(
      (pendingEffect: PendingEffect): boolean =>
        pendingEffect.handler() === DARWINS_VOYAGE
    );

/** The two completions, as Darwin's Voyage is built; one at once if its player is researching. */
export const darwinsVoyageCompleteRules = (
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance,
  pendingEffects: PendingEffectRegistry = pendingEffectRegistryInstance
): BuildingComplete[] => [
  new BuildingComplete(
    'civ2-wonder:city/building-complete/darwins-voyage',
    new Criterion(
      (cityBuild: CityBuild, built: BuildableInstance): boolean =>
        built instanceof DarwinsVoyage
    ),
    new Effect((cityBuild: CityBuild): void => {
      const playerResearch = playerResearchRegistry.getByPlayer(
          cityBuild.city().player()
        ),
        pendingEffect = new PendingEffect(DARWINS_VOYAGE, playerResearch, {
          remaining: String(DARWINS_VOYAGE_ADVANCES),
        });

      pendingEffects.register(pendingEffect);

      if (playerResearch.researching() !== null) {
        spend(playerResearch, pendingEffect, pendingEffects);
      }
    }),
    new Description({
      type: 'free_advances',
      subject: DarwinsVoyage,
      value: DARWINS_VOYAGE_ADVANCES,
    })
  ),
];

/**
 * Each research a player starts while a completion is owed is completed at once. Registers the handler for the last
 *  one, so a game saved while one is owed can spend it after a load.
 */
export const darwinsVoyageStartedRules = (
  pendingEffects: PendingEffectRegistry = pendingEffectRegistryInstance
): Started[] => {
  pendingEffects.handler(DARWINS_VOYAGE, (pendingEffect: PendingEffect): void =>
    completeResearch(pendingEffect.target() as PlayerResearch)
  );

  return [
    new Started(
      'civ2-wonder:player/research-started/darwins-voyage',
      new Criterion(
        (playerResearch: PlayerResearch): boolean =>
          owed(playerResearch, pendingEffects).length > 0
      ),
      new Effect(
        (playerResearch: PlayerResearch, _advance: typeof Advance): void =>
          owed(playerResearch, pendingEffects).forEach(
            (pendingEffect: PendingEffect): void =>
              spend(playerResearch, pendingEffect, pendingEffects)
          )
      )
    ),
  ];
};
