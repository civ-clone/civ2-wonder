"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = exports.GREAT_LIBRARY_HOLDERS = void 0;
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const RequirementRegistry_1 = require("@civ-clone/core-requirement/RequirementRegistry");
const WonderRegistry_1 = require("@civ-clone/core-wonder/WonderRegistry");
const Wonders_1 = require("../../Wonders");
const greatLibraryRules_1 = require("@civ-clone/base-wonder/lib/greatLibraryRules");
const isBarbarian_1 = require("@civ-clone/base-civilization-barbarian/isBarbarian");
/**
 * The Great Library gives its owner an advance once 2 civilizations have it (OpenCiv2 `civ_give_advance`,
 *  richardpenman/civ2@49f26ec, counts civilizations 1 to 7: never the barbarians).
 */
exports.GREAT_LIBRARY_HOLDERS = 2;
const getRules = (playerResearchRegistry = PlayerResearchRegistry_1.instance, wonderRegistry = WonderRegistry_1.instance, requirementRegistry = RequirementRegistry_1.instance) => (0, greatLibraryRules_1.greatLibraryRules)({
    GreatLibrary: Wonders_1.GreatLibrary,
    holders: exports.GREAT_LIBRARY_HOLDERS,
    counts: (playerResearch) => !(0, isBarbarian_1.default)(playerResearch.player()),
}, playerResearchRegistry, wonderRegistry, requirementRegistry);
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=research-complete.js.map