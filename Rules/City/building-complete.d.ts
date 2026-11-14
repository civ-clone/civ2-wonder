import { CityBuildRegistry } from '@civ-clone/core-city-build/CityBuildRegistry';
import { Engine } from '@civ-clone/core-engine/Engine';
import { PendingEffectRegistry } from '@civ-clone/core-pending-effect';
import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import { WonderRegistry } from '@civ-clone/core-wonder/WonderRegistry';
import BuildingComplete from '@civ-clone/core-city-build/Rules/BulidingComplete';
/**
 * A Wonder completed is registered, rivals building it are dropped and `wonder:built` is emitted (base-wonder). Darwin's
 *  Voyage completes the player's research twice (OpenCiv2 `city_process_production_complete_improvement` calls
 *  `civ_research_complete` twice, richardpenman/civ2@49f26ec): one now if they're researching, and one for each
 *  research started after, owed in the save until then.
 */
export declare const getRules: (
  cityBuildRegistry?: CityBuildRegistry,
  playerResearchRegistry?: PlayerResearchRegistry,
  wonderRegistry?: WonderRegistry,
  engine?: Engine,
  pendingEffects?: PendingEffectRegistry
) => BuildingComplete[];
export default getRules;
