"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const CityBuildRegistry_1 = require("@civ-clone/core-city-build/CityBuildRegistry");
const Engine_1 = require("@civ-clone/core-engine/Engine");
const core_pending_effect_1 = require("@civ-clone/core-pending-effect");
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const WonderRegistry_1 = require("@civ-clone/core-wonder/WonderRegistry");
const RuleIds_1 = require("../../RuleIds");
const Wonders_1 = require("../../Wonders");
const freeResearch_1 = require("@civ-clone/base-wonder/lib/freeResearch");
const lifecycleRules_1 = require("@civ-clone/base-wonder/lib/lifecycleRules");
/**
 * A Wonder completed is registered, rivals building it are dropped and `wonder:built` is emitted (base-wonder). Darwin's
 *  Voyage completes the player's research twice (OpenCiv2 `city_process_production_complete_improvement` calls
 *  `civ_research_complete` twice, richardpenman/civ2@49f26ec): one now if they're researching, and one for each
 *  research started after, owed in the save until then.
 */
const getRules = (cityBuildRegistry = CityBuildRegistry_1.instance, playerResearchRegistry = PlayerResearchRegistry_1.instance, wonderRegistry = WonderRegistry_1.instance, engine = Engine_1.instance, pendingEffects = core_pending_effect_1.instance) => [
    ...(0, lifecycleRules_1.wonderBuiltRules)(cityBuildRegistry, wonderRegistry, engine),
    (0, freeResearch_1.freeResearchOnCompletion)(Wonders_1.DarwinsVoyage, RuleIds_1.DARWINS_VOYAGE, 2, playerResearchRegistry, pendingEffects),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=building-complete.js.map