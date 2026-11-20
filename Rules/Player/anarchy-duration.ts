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
import AnarchyDuration from '@civ-clone/base-government-change/Rules/AnarchyDuration';
import Criterion from '@civ-clone/core-rule/Criterion';
import Description from '@civ-clone/core-rule/Description';
import Effect from '@civ-clone/core-rule/Effect';
import Player from '@civ-clone/core-player/Player';
import { STATUE_OF_LIBERTY_ANARCHY_RULE } from '../../RuleIds';
import { StatueOfLiberty } from '../../Wonders';
import { playerOwnsWonder } from '@civ-clone/base-wonder/lib/hasWonder';

// The Statue of Liberty's owner leaves Anarchy at the next turn's start, rather than waiting for a turn that is a
//  multiple of 4 (OpenCiv2 `civ_turn_update_diplomacy`, richardpenman/civ2@49f26ec). The shortest `AnarchyDuration`
//  wins (base-government-change), so this shortens civ2-government's for any cause.
/** The turns of Anarchy the Statue of Liberty's owner has, read by its rule and by what it says it does. */
export const statueOfLibertyAnarchyTurns: number = 1;

export const getRules = (
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance,
  wonderRegistry: WonderRegistry = wonderRegistryInstance,
  requirementRegistry: RequirementRegistry = requirementRegistryInstance
): AnarchyDuration[] => [
  new AnarchyDuration(
    STATUE_OF_LIBERTY_ANARCHY_RULE,
    new Criterion((player: Player): boolean =>
      playerOwnsWonder(
        player,
        StatueOfLiberty,
        wonderRegistry,
        playerResearchRegistry,
        requirementRegistry
      )
    ),
    new Effect((): number => statueOfLibertyAnarchyTurns),
    new Description({
      type: 'anarchy_turns',
      subject: StatueOfLiberty,
      value: statueOfLibertyAnarchyTurns,
    })
  ),
];

export default getRules;
