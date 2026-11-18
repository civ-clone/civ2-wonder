import {
  builtOnceRule,
  deriveBuildRules,
} from '@civ-clone/base-wonder/lib/buildRules';
import {
  dropBuiltWonderRules,
  wonderDestroyedRules,
  wonderObsoleteRules,
} from '@civ-clone/base-wonder/lib/lifecycleRules';
import {
  helpBuildWonderActionRules,
  wonderHelpedRules,
} from '@civ-clone/base-wonder/lib/helpBuildWonder';
import { Game, defaultGame } from '@civ-clone/core-game';
import buildRequirements, { obsoletedBy } from './Requirements';
import Production from '@civ-clone/base-terrain-yield-production/Production';
import cityBuildCost from './Rules/City/build-cost';
import cityBuildPriority, {
  manhattanProjectRules,
} from './Rules/City/build-priority';
import cityBuildingComplete from './Rules/City/building-complete';
import cityCost from './Rules/City/cost';
import cityYield from './Rules/City/yield';
import cityYieldModifier from './Rules/City/yield-modifier';
import diplomacy from './lib/diplomacy';
import { deriveObsoleteRules } from '@civ-clone/base-wonder/lib/obsoleteRules';
import cityCaptured from './Rules/City/captured';
import cityTileYield from './Rules/City/tile-yield';
import { darwinsVoyageStartedRules } from './lib/darwinsVoyage';
import upgradedRules from '@civ-clone/base-unit-upgrade/lib/upgradedRules';
import Veteran from '@civ-clone/base-unit-improvement-veteran/UnitImprovements/Veteran';
import governmentsAvailability from './Rules/Governments/availability';
import playerAnarchyDuration from './Rules/Player/anarchy-duration';
import playerResearchComplete from './Rules/Player/research-complete';
import promotionChance from './Rules/Unit/promotion-chance';
import unitYield from './Rules/Unit/yield';

export const register = (game: Game): void => {
  // What Leonardo's Workshop needs to upgrade units: the game's own transport registry and rules go to a unit that
  //  becomes a transport (base-unit-upgrade's `changeType`).
  const leonardoRegistries = {
    playerResearchRegistry: game.playerResearch,
    requirementRegistry: game.requirements,
    ruleRegistry: game.rules,
    transportRegistry: game.transports,
    unitRegistry: game.units,
    wonderRegistry: game.wonders,
  };

  game.rules.register(
    builtOnceRule('civ2-wonder', game.wonders, game.cityImprovements)
  );

  // Which Wonders a city may build, from the entries in `Requirements`, through the game's `requirements`.
  game.requirements.add(
    deriveBuildRules(game.playerResearch, game.wonders, game.cityImprovements),
    ...buildRequirements
  );

  game.rules.register(
    ...cityBuildPriority(
      game.cities,
      game.cityBuilds,
      game.playerResearch,
      game.units,
      game.requirements
    ),
    ...manhattanProjectRules({
      clientRegistry: game.clients,
      playerRegistry: game.players,
      playerResearchRegistry: game.playerResearch,
      ruleRegistry: game.rules,
      traitRegistry: game.traits,
      unitRegistry: game.units,
    }),
    ...cityBuildCost(),
    ...cityBuildingComplete({
      ...leonardoRegistries,
      cityBuildRegistry: game.cityBuilds,
      engine: game.engine,
      pendingEffects: game.pendingEffects,
      playerWorldRegistry: game.playerWorlds,
    }),
    ...cityCaptured(leonardoRegistries, game.rules),
    ...cityCost(game.playerResearch, game.wonders, game.requirements),
    ...wonderDestroyedRules(game.wonders),
    ...dropBuiltWonderRules(
      'civ2-wonder',
      Production,
      game.cityBuilds,
      game.wonders,
      game.cityImprovements
    ),
    ...cityYield({
      playerResearchRegistry: game.playerResearch,
      requirementRegistry: game.requirements,
      wonderRegistry: game.wonders,
    }),
    // The Colossus and King Richard's Crusade, at their steps of each worked square's yields.
    ...cityTileYield({
      playerResearchRegistry: game.playerResearch,
      requirementRegistry: game.requirements,
      wonderRegistry: game.wonders,
    }),
    ...cityYieldModifier({
      playerResearchRegistry: game.playerResearch,
      requirementRegistry: game.requirements,
      wonderRegistry: game.wonders,
    }),
    ...governmentsAvailability(
      game.playerResearch,
      game.wonders,
      game.requirements
    ),
    ...playerAnarchyDuration(
      game.playerResearch,
      game.wonders,
      game.requirements
    ),
    ...playerResearchComplete(
      game.playerResearch,
      game.wonders,
      game.requirements,
      leonardoRegistries
    ),
    // An upgraded unit is no longer a veteran, and the client is told (`civ_leonardo_upgrade` clears `UNITF_VETERAN`).
    ...upgradedRules('civ2-wonder:unit/upgraded', {
      loses: [Veteran],
      engine: game.engine,
      unitImprovementRegistry: game.unitImprovements,
    })
  );

  // Wonders going obsolete (@ENDWONDER): announced on the first discovery; base-wonder's `isObsolete` reads the entries.
  game.requirements.add(
    deriveObsoleteRules(game.playerResearch, game.rules, game.wonders),
    ...obsoletedBy
  );

  game.rules.register(
    ...darwinsVoyageStartedRules(game.pendingEffects),
    ...helpBuildWonderActionRules(
      'civ2-wonder',
      game.cities,
      game.cityBuilds,
      game.rules
    ),
    ...wonderHelpedRules(
      'civ2-wonder',
      Production,
      game.cityBuilds,
      game.rules
    ),
    ...unitYield(game.wonders, game.playerResearch, game.requirements),
    ...promotionChance(game.wonders, game.playerResearch, game.requirements),
    ...wonderObsoleteRules(game.engine),
    // Marco Polo's, the United Nations, the Eiffel Tower and the Manhattan Project in diplomacy.
    ...diplomacy({
      interactionRegistry: game.interactions,
      pendingEffectRegistry: game.pendingEffects,
      playerRegistry: game.players,
      playerResearchRegistry: game.playerResearch,
      requirementRegistry: game.requirements,
      ruleRegistry: game.rules,
      turn: game.turn,
      wonderRegistry: game.wonders,
    })
  );
};

// The plugin loader imports each package for this side effect.
register(defaultGame);

export default register;
