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
import { DARWINS_VOYAGE } from './RuleIds';
import Production from '@civ-clone/base-terrain-yield-production/Production';
import cityBuildCost from './Rules/City/build-cost';
import cityBuildPriority from './Rules/City/build-priority';
import cityBuildingComplete from './Rules/City/building-complete';
import cityCost from './Rules/City/cost';
import cityYield from './Rules/City/yield';
import cityYieldModifier from './Rules/City/yield-modifier';
import { deriveObsoleteRules } from '@civ-clone/base-wonder/lib/obsoleteRules';
import { freeResearchStartedRules } from '@civ-clone/base-wonder/lib/freeResearch';
import governmentsAvailability from './Rules/Governments/availability';
import playerAnarchyDuration from './Rules/Player/anarchy-duration';
import playerResearchComplete from './Rules/Player/research-complete';
import unitYield from './Rules/Unit/yield';

export const register = (game: Game): void => {
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
    ...cityBuildCost(),
    ...cityBuildingComplete(
      game.cityBuilds,
      game.playerResearch,
      game.wonders,
      game.engine,
      game.pendingEffects
    ),
    ...cityCost(game.playerResearch, game.wonders, game.requirements),
    ...wonderDestroyedRules(game.wonders),
    ...dropBuiltWonderRules(
      'civ2-wonder',
      Production,
      game.cityBuilds,
      game.wonders,
      game.cityImprovements
    ),
    ...cityYield(game.playerResearch, game.wonders, game.requirements),
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
      game.requirements
    )
  );

  // Wonders going obsolete (@ENDWONDER): announced on the first discovery; base-wonder's `isObsolete` reads the entries.
  game.requirements.add(
    deriveObsoleteRules(game.playerResearch, game.rules, game.wonders),
    ...obsoletedBy
  );

  game.rules.register(
    ...freeResearchStartedRules(DARWINS_VOYAGE, game.pendingEffects),
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
    ...wonderObsoleteRules(game.engine)
  );
};

// The plugin loader imports each package for this side effect.
register(defaultGame);

export default register;
