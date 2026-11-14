import {
  PlayerResearchRegistry,
  instance as playerResearchRegistryInstance,
} from '@civ-clone/core-science/PlayerResearchRegistry';
import {
  RequirementRegistry,
  instance as requirementRegistryInstance,
} from '@civ-clone/core-requirement/RequirementRegistry';
import {
  WonderRegistry,
  instance as wonderRegistryInstance,
} from '@civ-clone/core-wonder/WonderRegistry';
import Complete from '@civ-clone/core-science/Rules/Complete';
import { GreatLibrary } from '../../Wonders';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import { greatLibraryRules } from '@civ-clone/base-wonder/lib/greatLibraryRules';
import isBarbarian from '@civ-clone/base-civilization-barbarian/isBarbarian';

/**
 * The Great Library gives its owner an advance once 2 civilizations have it (OpenCiv2 `civ_give_advance`,
 *  richardpenman/civ2@49f26ec, counts civilizations 1 to 7: never the barbarians).
 */
export const GREAT_LIBRARY_HOLDERS = 2;

export const getRules = (
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance,
  wonderRegistry: WonderRegistry = wonderRegistryInstance,
  requirementRegistry: RequirementRegistry = requirementRegistryInstance
): Complete[] =>
  greatLibraryRules(
    {
      GreatLibrary,
      holders: GREAT_LIBRARY_HOLDERS,
      counts: (playerResearch: PlayerResearch): boolean =>
        !isBarbarian(playerResearch.player()),
    },
    playerResearchRegistry,
    wonderRegistry,
    requirementRegistry
  );

export default getRules;
