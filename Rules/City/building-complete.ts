import { ApolloProgram, LeonardosWorkshop } from '../../Wonders';
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
  PlayerWorldRegistry,
  instance as playerWorldRegistryInstance,
} from '@civ-clone/core-player-world/PlayerWorldRegistry';
import {
  WonderRegistry,
  instance as wonderRegistryInstance,
} from '@civ-clone/core-wonder/WonderRegistry';
import leonardoUpgrade, { LeonardoRegistries } from '../../lib/leonardo';
import { BuildableInstance } from '@civ-clone/core-city-build/Buildable';
import BuildingComplete from '@civ-clone/core-city-build/Rules/BulidingComplete';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import Criterion from '@civ-clone/core-rule/Criterion';
import Description from '@civ-clone/core-rule/Description';
import Effect from '@civ-clone/core-rule/Effect';
import PlayerWorld from '@civ-clone/core-player-world/PlayerWorld';
import { darwinsVoyageCompleteRules } from '../../lib/darwinsVoyage';
import { wonderBuiltRules } from '@civ-clone/base-wonder/lib/lifecycleRules';

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
export const getRules = ({
  cityBuildRegistry = cityBuildRegistryInstance,
  engine = engineInstance,
  pendingEffects = pendingEffectRegistryInstance,
  playerResearchRegistry = playerResearchRegistryInstance,
  playerWorldRegistry = playerWorldRegistryInstance,
  wonderRegistry = wonderRegistryInstance,
  ...leonardoRegistries
}: BuildingCompleteRegistries = {}): BuildingComplete[] => {
  const upgrade = leonardoUpgrade({
    playerResearchRegistry,
    wonderRegistry,
    ...leonardoRegistries,
  });

  return [
    ...wonderBuiltRules(cityBuildRegistry, wonderRegistry, engine),
    ...darwinsVoyageCompleteRules(playerResearchRegistry, pendingEffects),
    new BuildingComplete(
      'civ2-wonder:city/building-complete/leonardos-workshop',
      new Criterion(
        (cityBuild: CityBuild, built: BuildableInstance): boolean =>
          built instanceof LeonardosWorkshop
      ),
      new Effect((cityBuild: CityBuild): void => {
        upgrade(cityBuild.city().player());
      })
    ),
    new BuildingComplete(
      'civ2-wonder:city/building-complete/apollo-program',
      new Criterion(
        (cityBuild: CityBuild, built: BuildableInstance): boolean =>
          built instanceof ApolloProgram
      ),
      new Effect((cityBuild: CityBuild, built: BuildableInstance): void => {
        const tiles = cityBuild.city().tile().map().entries();

        playerWorldRegistry.forEach((playerWorld: PlayerWorld): void =>
          playerWorld.register(...tiles)
        );

        engine.emit('wonder:apollo-revealed', built, cityBuild.city());
      }),
      new Description({
        type: 'reveals_map',
        subject: ApolloProgram,
        scope: 'world',
      })
    ),
  ];
};

export default getRules;
