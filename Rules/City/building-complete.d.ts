import { CityBuildRegistry } from '@civ-clone/core-city-build/CityBuildRegistry';
import { Engine } from '@civ-clone/core-engine/Engine';
import { PendingEffectRegistry } from '@civ-clone/core-pending-effect';
import { PlayerWorldRegistry } from '@civ-clone/core-player-world/PlayerWorldRegistry';
import { LeonardoRegistries } from '../../lib/leonardo';
import BuildingComplete from '@civ-clone/core-city-build/Rules/BulidingComplete';
export interface BuildingCompleteRegistries extends LeonardoRegistries {
  cityBuildRegistry?: CityBuildRegistry;
  engine?: Engine;
  pendingEffects?: PendingEffectRegistry;
  playerWorldRegistry?: PlayerWorldRegistry;
}
/**
 * A Wonder completed is registered, rivals building it are dropped and `wonder:built` is emitted (base-wonder). Then,
 *  as OpenCiv2 `city_process_production_complete_improvement` (`src/auto/city_production.cpp`,
 *  richardpenman/civ2@49f26ec) goes on, in its order:
 * - Darwin's Voyage completes its player's research twice (`lib/darwinsVoyage`);
 * - Leonardo's Workshop upgrades its player's units at once (`civ_leonardo_upgrade`, `lib/leonardo`);
 * - the Apollo Program shows every player the whole map (`wonder_apollo_reveal_map` makes every square visible to all
 *   eight civilizations and every city known to them all, not just to its builder). A client learns of each square
 *   through `PlayerWorld#register`'s `VisibilityChanged`, and of the reveal itself from `wonder:apollo-revealed`.
 */
export declare const getRules: ({
  cityBuildRegistry,
  engine,
  pendingEffects,
  playerResearchRegistry,
  playerWorldRegistry,
  wonderRegistry,
  ...leonardoRegistries
}?: BuildingCompleteRegistries) => BuildingComplete[];
export default getRules;
