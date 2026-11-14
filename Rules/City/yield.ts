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
import {
  Colossus,
  CureForCancer,
  HangingGardens,
  KingRichardsCrusade,
} from '../../Wonders';
import {
  cityHasWonder,
  playerHasWonder,
} from '@civ-clone/base-wonder/lib/hasWonder';
import City from '@civ-clone/core-city/City';
import CityYield from '@civ-clone/core-city/Rules/Yield';
import Effect from '@civ-clone/core-rule/Effect';
import Happiness from '@civ-clone/base-city-yield-happiness/Happiness';
import Priority from '@civ-clone/core-rule/Priority';
import Production from '@civ-clone/base-terrain-yield-production/Production';
import Trade from '@civ-clone/base-terrain-yield-trade/Trade';
import Yield from '@civ-clone/core-yield/Yield';

import {
  PendingEffectRegistry,
  instance as pendingEffectRegistryInstance,
} from '@civ-clone/core-pending-effect';
import {
  PlayerGovernmentRegistry,
  instance as playerGovernmentRegistryInstance,
} from '@civ-clone/core-government/PlayerGovernmentRegistry';
import {
  TileImprovementRegistry,
  instance as tileImprovementRegistryInstance,
} from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import Criterion from '@civ-clone/core-rule/Criterion';
import PlayerGovernment from '@civ-clone/core-government/PlayerGovernment';
import { leaderCelebration } from '@civ-clone/civ2-city-happiness/lib/cityStatus';
import squareBonus from '../../lib/squareBonus';

export interface CityYieldRegistries {
  pendingEffects?: PendingEffectRegistry;
  playerGovernmentRegistry?: PlayerGovernmentRegistry;
  playerResearchRegistry?: PlayerResearchRegistry;
  requirementRegistry?: RequirementRegistry;
  tileImprovementRegistry?: TileImprovementRegistry;
  wonderRegistry?: WonderRegistry;
}

// OpenCiv2 (richardpenman/civ2@49f26ec):
// - `city_tile_yield`: in the Colossus' city each worked square that yields trade (every ocean square, and a land
//   square once its trade isn't 0) gets 1 more; in King Richard's Crusade's city every worked square gets 1 more shield.
//   The +1 comes before the square's later steps (a railroad's half again, the penalty below Monarchy, the Republic's
//   bonus, pollution), so it's worked out through them (`lib/squareBonus`): under Despotism a 2-trade ocean square
//   stays at 2.
// - `city_calc_trade_happiness`: the Hanging Gardens make 1 citizen happy in each of their owner's cities and 2 more in
//   their own; the Cure for Cancer 1 in each of its owner's cities.
// Each Wonder stops once it's obsolete or its city is lost (base-wonder's `cityHasWonder` and `playerHasWonder`).
export const getRules = ({
  pendingEffects = pendingEffectRegistryInstance,
  playerGovernmentRegistry = playerGovernmentRegistryInstance,
  playerResearchRegistry = playerResearchRegistryInstance,
  requirementRegistry = requirementRegistryInstance,
  tileImprovementRegistry = tileImprovementRegistryInstance,
  wonderRegistry = wonderRegistryInstance,
}: CityYieldRegistries = {}): CityYield[] => {
  const governmentOf = (city: City): PlayerGovernment | null => {
      try {
        return playerGovernmentRegistry.getByPlayer(city.player());
      } catch (e) {
        return null;
      }
    },
    bonus = (
      city: City,
      YieldType: typeof Yield,
      applies: (before: number) => boolean
    ): number =>
      squareBonus(
        city,
        YieldType,
        governmentOf(city),
        leaderCelebration(city, pendingEffects) !== null,
        applies,
        tileImprovementRegistry
      );

  return [
    new CityYield(
      'civ2-wonder:city/yield/colossus',
      new Priority(500),
      cityHasWonder(
        Colossus,
        wonderRegistry,
        playerResearchRegistry,
        requirementRegistry
      ),
      new Criterion(
        (city: City): boolean => bonus(city, Trade, (before) => before > 0) > 0
      ),
      new Effect(
        (city: City): Yield =>
          new Trade(
            bonus(city, Trade, (before) => before > 0),
            Colossus.name
          )
      )
    ),

    new CityYield(
      'civ2-wonder:city/yield/king-richards-crusade',
      new Priority(500),
      cityHasWonder(
        KingRichardsCrusade,
        wonderRegistry,
        playerResearchRegistry,
        requirementRegistry
      ),
      new Criterion(
        (city: City): boolean => bonus(city, Production, () => true) > 0
      ),
      new Effect(
        (city: City): Yield =>
          new Production(
            bonus(city, Production, () => true),
            KingRichardsCrusade.name
          )
      )
    ),

    new CityYield(
      'civ2-wonder:city/yield/hanging-gardens',
      playerHasWonder(
        HangingGardens,
        wonderRegistry,
        playerResearchRegistry,
        requirementRegistry
      ),
      new Effect((): Yield => new Happiness(1, HangingGardens.name))
    ),

    new CityYield(
      'civ2-wonder:city/yield/hanging-gardens-city',
      cityHasWonder(
        HangingGardens,
        wonderRegistry,
        playerResearchRegistry,
        requirementRegistry
      ),
      new Effect((): Yield => new Happiness(2, HangingGardens.name))
    ),

    new CityYield(
      'civ2-wonder:city/yield/cure-for-cancer',
      playerHasWonder(
        CureForCancer,
        wonderRegistry,
        playerResearchRegistry,
        requirementRegistry
      ),
      new Effect((): Yield => new Happiness(1, CureForCancer.name))
    ),
  ];
};

export default getRules;
