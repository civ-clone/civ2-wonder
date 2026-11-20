"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.darwinsVoyageStartedRules = exports.darwinsVoyageCompleteRules = exports.completeResearch = exports.DARWINS_VOYAGE_ADVANCES = void 0;
const core_pending_effect_1 = require("@civ-clone/core-pending-effect");
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const BulidingComplete_1 = require("@civ-clone/core-city-build/Rules/BulidingComplete");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Description_1 = require("@civ-clone/core-rule/Description");
const RuleIds_1 = require("../RuleIds");
const Wonders_1 = require("../Wonders");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Started_1 = require("@civ-clone/core-science/Rules/Started");
// Darwin's Voyage: OpenCiv2 `city_process_production_complete_improvement` (`src/auto/city_production.cpp`,
//  richardpenman/civ2@49f26ec) calls `civ_research_complete` twice. Each call gives the player what they're
//  researching, choosing it first if they aren't researching anything, and sets `research_progress` to 0, so whatever
//  was saved towards it is spent and none carries over. base-wonder's free completions add a whole cost instead, which
//  keeps the progress; these keep the original's.
//
// The choice the original makes there and then (`civ_choose_research`, the human's dialog or the computer's pick)
//  can't happen inside a city's production here: a completion owed to a player researching nothing waits, saved as a
//  `PendingEffect` under `DARWINS_VOYAGE`, until they next choose, and is spent at once then.
/** The research Darwin's Voyage completes, read by its rule and by what it says it does (civ-clone/web-renderer#1196). */
exports.DARWINS_VOYAGE_ADVANCES = 2;
/** `civ_research_complete`: the advance being researched is given, and the progress towards research is 0 after. */
const completeResearch = (playerResearch) => {
    playerResearch.progress().set(playerResearch.cost().value());
    playerResearch.check();
};
exports.completeResearch = completeResearch;
const spend = (playerResearch, pendingEffect, pendingEffects) => {
    const remaining = Number(pendingEffect.data().remaining);
    if (remaining <= 1) {
        // The handler (below) completes it.
        pendingEffects.discharge(pendingEffect);
        return;
    }
    pendingEffect.setData({ remaining: String(remaining - 1) });
    (0, exports.completeResearch)(playerResearch);
};
const owed = (playerResearch, pendingEffects) => pendingEffects
    .getByTarget(playerResearch)
    .filter((pendingEffect) => pendingEffect.handler() === RuleIds_1.DARWINS_VOYAGE);
/** The two completions, as Darwin's Voyage is built; one at once if its player is researching. */
const darwinsVoyageCompleteRules = (playerResearchRegistry = PlayerResearchRegistry_1.instance, pendingEffects = core_pending_effect_1.instance) => [
    new BulidingComplete_1.default('civ2-wonder:city/building-complete/darwins-voyage', new Criterion_1.default((cityBuild, built) => built instanceof Wonders_1.DarwinsVoyage), new Effect_1.default((cityBuild) => {
        const playerResearch = playerResearchRegistry.getByPlayer(cityBuild.city().player()), pendingEffect = new core_pending_effect_1.PendingEffect(RuleIds_1.DARWINS_VOYAGE, playerResearch, {
            remaining: String(exports.DARWINS_VOYAGE_ADVANCES),
        });
        pendingEffects.register(pendingEffect);
        if (playerResearch.researching() !== null) {
            spend(playerResearch, pendingEffect, pendingEffects);
        }
    }), new Description_1.default({
        type: 'free_advances',
        subject: Wonders_1.DarwinsVoyage,
        value: exports.DARWINS_VOYAGE_ADVANCES,
    })),
];
exports.darwinsVoyageCompleteRules = darwinsVoyageCompleteRules;
/**
 * Each research a player starts while a completion is owed is completed at once. Registers the handler for the last
 *  one, so a game saved while one is owed can spend it after a load.
 */
const darwinsVoyageStartedRules = (pendingEffects = core_pending_effect_1.instance) => {
    pendingEffects.handler(RuleIds_1.DARWINS_VOYAGE, (pendingEffect) => (0, exports.completeResearch)(pendingEffect.target()));
    return [
        new Started_1.default('civ2-wonder:player/research-started/darwins-voyage', new Criterion_1.default((playerResearch) => owed(playerResearch, pendingEffects).length > 0), new Effect_1.default((playerResearch, _advance) => owed(playerResearch, pendingEffects).forEach((pendingEffect) => spend(playerResearch, pendingEffect, pendingEffects)))),
    ];
};
exports.darwinsVoyageStartedRules = darwinsVoyageStartedRules;
//# sourceMappingURL=darwinsVoyage.js.map