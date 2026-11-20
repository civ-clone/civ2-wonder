import {
  Communism,
  Democracy,
  Fundamentalism,
  Monarchy,
  Republic,
} from '@civ-clone/civ2-government/Governments';
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
import Availability from '@civ-clone/core-government/Rules/Availability';
import Criterion from '@civ-clone/core-rule/Criterion';
import Description from '@civ-clone/core-rule/Description';
import Government from '@civ-clone/core-government/Government';
import Player from '@civ-clone/core-player/Player';
import { STATUE_OF_LIBERTY_AVAILABILITY_RULE } from '../../RuleIds';
import { StatueOfLiberty } from '../../Wonders';
import { playerOwnsWonder } from '@civ-clone/base-wonder/lib/hasWonder';

/** Every government but Anarchy (Despotism is always offered anyway). */
export const statueOfLibertyGovernments: (typeof Government)[] = [
  Monarchy,
  Communism,
  Fundamentalism,
  Republic,
  Democracy,
];

// The Statue of Liberty's owner may choose any government, whichever advances they have (OpenCiv2
//  `civ_can_choose_government`, richardpenman/civ2@49f26ec). A government is offered if any `Availability` rule allows
//  it, so this is one more way to each, beside civ2-government's.
export const getRules = (
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance,
  wonderRegistry: WonderRegistry = wonderRegistryInstance,
  requirementRegistry: RequirementRegistry = requirementRegistryInstance
): Availability[] => [
  new Availability(
    STATUE_OF_LIBERTY_AVAILABILITY_RULE,
    new Criterion((GovernmentType: typeof Government): boolean =>
      statueOfLibertyGovernments.includes(GovernmentType)
    ),
    new Criterion(
      (GovernmentType: typeof Government, player: Player): boolean =>
        playerOwnsWonder(
          player,
          StatueOfLiberty,
          wonderRegistry,
          playerResearchRegistry,
          requirementRegistry
        )
    ),
    new Description({ type: 'any_government', subject: StatueOfLiberty })
  ),
];

export default getRules;
