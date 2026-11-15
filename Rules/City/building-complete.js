"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Wonders_1 = require("../../Wonders");
const CityBuildRegistry_1 = require("@civ-clone/core-city-build/CityBuildRegistry");
const Engine_1 = require("@civ-clone/core-engine/Engine");
const core_pending_effect_1 = require("@civ-clone/core-pending-effect");
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const PlayerWorldRegistry_1 = require("@civ-clone/core-player-world/PlayerWorldRegistry");
const WonderRegistry_1 = require("@civ-clone/core-wonder/WonderRegistry");
const leonardo_1 = require("../../lib/leonardo");
const BulidingComplete_1 = require("@civ-clone/core-city-build/Rules/BulidingComplete");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const darwinsVoyage_1 = require("../../lib/darwinsVoyage");
const lifecycleRules_1 = require("@civ-clone/base-wonder/lib/lifecycleRules");
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
const getRules = ({ cityBuildRegistry = CityBuildRegistry_1.instance, engine = Engine_1.instance, pendingEffects = core_pending_effect_1.instance, playerResearchRegistry = PlayerResearchRegistry_1.instance, playerWorldRegistry = PlayerWorldRegistry_1.instance, wonderRegistry = WonderRegistry_1.instance, ...leonardoRegistries } = {}) => {
    const upgrade = (0, leonardo_1.default)({
        playerResearchRegistry,
        wonderRegistry,
        ...leonardoRegistries,
    });
    return [
        ...(0, lifecycleRules_1.wonderBuiltRules)(cityBuildRegistry, wonderRegistry, engine),
        ...(0, darwinsVoyage_1.darwinsVoyageCompleteRules)(playerResearchRegistry, pendingEffects),
        new BulidingComplete_1.default('civ2-wonder:city/building-complete/leonardos-workshop', new Criterion_1.default((cityBuild, built) => built instanceof Wonders_1.LeonardosWorkshop), new Effect_1.default((cityBuild) => {
            upgrade(cityBuild.city().player());
        })),
        new BulidingComplete_1.default('civ2-wonder:city/building-complete/apollo-program', new Criterion_1.default((cityBuild, built) => built instanceof Wonders_1.ApolloProgram), new Effect_1.default((cityBuild, built) => {
            const tiles = cityBuild.city().tile().map().entries();
            playerWorldRegistry.forEach((playerWorld) => playerWorld.register(...tiles));
            engine.emit('wonder:apollo-revealed', built, cityBuild.city());
        })),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=building-complete.js.map