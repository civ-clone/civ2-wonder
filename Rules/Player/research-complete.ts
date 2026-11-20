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
import leonardoUpgrade, {
  LeonardoRegistries,
  stolenAdvanceArrived,
} from '../../lib/leonardo';
import Complete from '@civ-clone/core-science/Rules/Complete';
import Description from '@civ-clone/core-rule/Description';
import Effect from '@civ-clone/core-rule/Effect';
import { GreatLibrary, LeonardosWorkshop } from '../../Wonders';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import { describedRule } from '../../lib/describedRule';
import { greatLibraryRules } from '@civ-clone/base-wonder/lib/greatLibraryRules';
import isBarbarian from '@civ-clone/base-civilization-barbarian/isBarbarian';

/**
 * The Great Library gives its owner an advance once 2 civilizations have it (OpenCiv2 `civ_give_advance`,
 *  richardpenman/civ2@49f26ec, counts civilizations 1 to 7: never the barbarians).
 */
export const GREAT_LIBRARY_HOLDERS = 2;

/**
 * Leonardo's Workshop upgrades its owner's units each time they're given an advance, however they got it, before the
 *  Great Library looks at it (OpenCiv2 `civ_give_advance` calls `civ_leonardo_upgrade` just ahead of its Great Library
 *  check). The advance is already theirs, so discovering the one that expires the Wonder upgrades nothing.
 */
export const getRules = (
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance,
  wonderRegistry: WonderRegistry = wonderRegistryInstance,
  requirementRegistry: RequirementRegistry = requirementRegistryInstance,
  leonardoRegistries: LeonardoRegistries = {}
): Complete[] => {
  const upgrade = leonardoUpgrade({
    playerResearchRegistry,
    requirementRegistry,
    wonderRegistry,
    ...leonardoRegistries,
  });

  return [
    new Complete(
      'civ2-wonder:player/research-complete/leonardos-workshop',
      new Effect((playerResearch: PlayerResearch): void => {
        const player = playerResearch.player();

        upgrade(player);

        // The advance taken from a captured city: `city_capture` then runs its own pass (`Rules/City/captured`).
        if (stolenAdvanceArrived(player)) {
          upgrade(player);
        }
      }),
      new Description({
        type: 'unit_upgrade',
        subject: LeonardosWorkshop,
        scope: 'player',
      })
    ),
    // base-wonder's rule, saying what it does (civ-clone/web-renderer#1196).
    ...greatLibraryRules(
      {
        GreatLibrary,
        holders: GREAT_LIBRARY_HOLDERS,
        counts: (playerResearch: PlayerResearch): boolean =>
          !isBarbarian(playerResearch.player()),
      },
      playerResearchRegistry,
      wonderRegistry,
      requirementRegistry
    ).map(
      (rule: Complete): Complete =>
        describedRule(
          rule,
          new Description({
            type: 'shared_advances',
            subject: GreatLibrary,
            value: GREAT_LIBRARY_HOLDERS,
          })
        )
    ),
  ];
};

export default getRules;
