import { Lighthouse, MagellansExpedition } from '../../Wonders';
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
import { isA } from '@civ-clone/core-unit/traits';
import CoastBound from '@civ-clone/base-unit-trait-coast-bound/CoastBound';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Priority from '@civ-clone/core-rule/Priority';
import { Movement } from '@civ-clone/core-unit/Yields';
import Naval from '@civ-clone/base-unit-type-naval/Naval';
import Unit from '@civ-clone/core-unit/Unit';
import UnitYield from '@civ-clone/core-unit/Rules/Yield';
import Yield from '@civ-clone/core-yield/Yield';
import { playerHasWonder } from '@civ-clone/base-wonder/lib/hasWonder';

// OpenCiv2 `unit_max_moves` (richardpenman/civ2@49f26ec), for a sea unit, in whole moves (the game counts in thirds):
//  Magellan's Expedition gives 2 more, and the Lighthouse 1 more to one that isn't coast-bound. Both come before a
//  damaged ship's moves are cut (civ2-unit's `Low` damaged-movement rule), as in the original, whichever package is
//  loaded first: they run at `BEFORE_DAMAGE`, between the `Normal` rules that set movement and the `Low` ones.
export const BEFORE_DAMAGE = 2500;
export const getRules = (
  wonderRegistry: WonderRegistry = wonderRegistryInstance,
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance,
  requirementRegistry: RequirementRegistry = requirementRegistryInstance
): UnitYield[] => {
  const isMovement = new Criterion(
      (unit: Unit, unitYield: Yield): boolean => unitYield instanceof Movement
    ),
    isNaval = new Criterion((unit: Unit): boolean => isA(unit, Naval));

  return [
    new UnitYield(
      'civ2-wonder:unit/yield/lighthouse',
      new Priority(BEFORE_DAMAGE),
      isMovement,
      isNaval,
      new Criterion((unit: Unit): boolean => !unit.hasTrait(CoastBound)),
      playerHasWonder(
        Lighthouse,
        wonderRegistry,
        playerResearchRegistry,
        requirementRegistry
      ),
      new Effect((unit: Unit, unitYield: Yield): void => unitYield.add(1))
    ),
    new UnitYield(
      'civ2-wonder:unit/yield/magellans-expedition',
      new Priority(BEFORE_DAMAGE),
      isMovement,
      isNaval,
      playerHasWonder(
        MagellansExpedition,
        wonderRegistry,
        playerResearchRegistry,
        requirementRegistry
      ),
      new Effect((unit: Unit, unitYield: Yield): void => unitYield.add(2))
    ),
  ];
};

export default getRules;
