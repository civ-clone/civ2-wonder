import {
  CityBuildRegistry,
  instance as cityBuildRegistryInstance,
} from '@civ-clone/core-city-build/CityBuildRegistry';
import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import {
  PendingEffectRegistry,
  instance as pendingEffectRegistryInstance,
} from '@civ-clone/core-pending-effect';
import {
  PlayerResearchRegistry,
  instance as playerResearchRegistryInstance,
} from '@civ-clone/core-science/PlayerResearchRegistry';
import {
  WonderRegistry,
  instance as wonderRegistryInstance,
} from '@civ-clone/core-wonder/WonderRegistry';
import BuildingComplete from '@civ-clone/core-city-build/Rules/BulidingComplete';
import { DARWINS_VOYAGE } from '../../RuleIds';
import { DarwinsVoyage } from '../../Wonders';
import { freeResearchOnCompletion } from '@civ-clone/base-wonder/lib/freeResearch';
import { wonderBuiltRules } from '@civ-clone/base-wonder/lib/lifecycleRules';

/**
 * A Wonder completed is registered, rivals building it are dropped and `wonder:built` is emitted (base-wonder). Darwin's
 *  Voyage completes the player's research twice (OpenCiv2 `city_process_production_complete_improvement` calls
 *  `civ_research_complete` twice, richardpenman/civ2@49f26ec): one now if they're researching, and one for each
 *  research started after, owed in the save until then.
 */
export const getRules = (
  cityBuildRegistry: CityBuildRegistry = cityBuildRegistryInstance,
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance,
  wonderRegistry: WonderRegistry = wonderRegistryInstance,
  engine: Engine = engineInstance,
  pendingEffects: PendingEffectRegistry = pendingEffectRegistryInstance
): BuildingComplete[] => [
  ...wonderBuiltRules(cityBuildRegistry, wonderRegistry, engine),
  freeResearchOnCompletion(
    DarwinsVoyage,
    DARWINS_VOYAGE,
    2,
    playerResearchRegistry,
    pendingEffects
  ),
];

export default getRules;
