"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = void 0;
const buildRules_1 = require("@civ-clone/base-wonder/lib/buildRules");
const lifecycleRules_1 = require("@civ-clone/base-wonder/lib/lifecycleRules");
const helpBuildWonder_1 = require("@civ-clone/base-wonder/lib/helpBuildWonder");
const core_game_1 = require("@civ-clone/core-game");
const Requirements_1 = require("./Requirements");
const RuleIds_1 = require("./RuleIds");
const Production_1 = require("@civ-clone/base-terrain-yield-production/Production");
const build_cost_1 = require("./Rules/City/build-cost");
const build_priority_1 = require("./Rules/City/build-priority");
const building_complete_1 = require("./Rules/City/building-complete");
const cost_1 = require("./Rules/City/cost");
const yield_1 = require("./Rules/City/yield");
const yield_modifier_1 = require("./Rules/City/yield-modifier");
const obsoleteRules_1 = require("@civ-clone/base-wonder/lib/obsoleteRules");
const freeResearch_1 = require("@civ-clone/base-wonder/lib/freeResearch");
const availability_1 = require("./Rules/Governments/availability");
const anarchy_duration_1 = require("./Rules/Player/anarchy-duration");
const research_complete_1 = require("./Rules/Player/research-complete");
const yield_2 = require("./Rules/Unit/yield");
const register = (game) => {
    game.rules.register((0, buildRules_1.builtOnceRule)('civ2-wonder', game.wonders, game.cityImprovements));
    // Which Wonders a city may build, from the entries in `Requirements`, through the game's `requirements`.
    game.requirements.add((0, buildRules_1.deriveBuildRules)(game.playerResearch, game.wonders, game.cityImprovements), ...Requirements_1.default);
    game.rules.register(...(0, build_priority_1.default)(game.cities, game.cityBuilds, game.playerResearch, game.units, game.requirements), ...(0, build_cost_1.default)(), ...(0, building_complete_1.default)(game.cityBuilds, game.playerResearch, game.wonders, game.engine, game.pendingEffects), ...(0, cost_1.default)(game.playerResearch, game.wonders, game.requirements), ...(0, lifecycleRules_1.wonderDestroyedRules)(game.wonders), ...(0, lifecycleRules_1.dropBuiltWonderRules)('civ2-wonder', Production_1.default, game.cityBuilds, game.wonders, game.cityImprovements), ...(0, yield_1.default)({
        pendingEffects: game.pendingEffects,
        playerGovernmentRegistry: game.playerGovernments,
        playerResearchRegistry: game.playerResearch,
        requirementRegistry: game.requirements,
        tileImprovementRegistry: game.tileImprovements,
        wonderRegistry: game.wonders,
    }), ...(0, yield_modifier_1.default)({
        playerResearchRegistry: game.playerResearch,
        requirementRegistry: game.requirements,
        wonderRegistry: game.wonders,
    }), ...(0, availability_1.default)(game.playerResearch, game.wonders, game.requirements), ...(0, anarchy_duration_1.default)(game.playerResearch, game.wonders, game.requirements), ...(0, research_complete_1.default)(game.playerResearch, game.wonders, game.requirements));
    // Wonders going obsolete (@ENDWONDER): announced on the first discovery; base-wonder's `isObsolete` reads the entries.
    game.requirements.add((0, obsoleteRules_1.deriveObsoleteRules)(game.playerResearch, game.rules, game.wonders), ...Requirements_1.obsoletedBy);
    game.rules.register(...(0, freeResearch_1.freeResearchStartedRules)(RuleIds_1.DARWINS_VOYAGE, game.pendingEffects), ...(0, helpBuildWonder_1.helpBuildWonderActionRules)('civ2-wonder', game.cities, game.cityBuilds, game.rules), ...(0, helpBuildWonder_1.wonderHelpedRules)('civ2-wonder', Production_1.default, game.cityBuilds, game.rules), ...(0, yield_2.default)(game.wonders, game.playerResearch, game.requirements), ...(0, lifecycleRules_1.wonderObsoleteRules)(game.engine));
};
exports.register = register;
// The plugin loader imports each package for this side effect.
(0, exports.register)(core_game_1.defaultGame);
exports.default = exports.register;
//# sourceMappingURL=registerRules.js.map