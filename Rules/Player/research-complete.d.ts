import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import { RequirementRegistry } from '@civ-clone/core-requirement/RequirementRegistry';
import { WonderRegistry } from '@civ-clone/core-wonder/WonderRegistry';
import { LeonardoRegistries } from '../../lib/leonardo';
import Complete from '@civ-clone/core-science/Rules/Complete';
/**
 * The Great Library gives its owner an advance once 2 civilizations have it (OpenCiv2 `civ_give_advance`,
 *  richardpenman/civ2@49f26ec, counts civilizations 1 to 7: never the barbarians).
 */
export declare const GREAT_LIBRARY_HOLDERS = 2;
/**
 * Leonardo's Workshop upgrades its owner's units each time they're given an advance, however they got it, before the
 *  Great Library looks at it (OpenCiv2 `civ_give_advance` calls `civ_leonardo_upgrade` just ahead of its Great Library
 *  check). The advance is already theirs, so discovering the one that expires the Wonder upgrades nothing.
 */
export declare const getRules: (
  playerResearchRegistry?: PlayerResearchRegistry,
  wonderRegistry?: WonderRegistry,
  requirementRegistry?: RequirementRegistry,
  leonardoRegistries?: LeonardoRegistries
) => Complete[];
export default getRules;
