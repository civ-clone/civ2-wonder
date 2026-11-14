"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const RequirementRegistry_1 = require("@civ-clone/core-requirement/RequirementRegistry");
const WonderRegistry_1 = require("@civ-clone/core-wonder/WonderRegistry");
const AnarchyDuration_1 = require("@civ-clone/base-government-change/Rules/AnarchyDuration");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const RuleIds_1 = require("../../RuleIds");
const Wonders_1 = require("../../Wonders");
const hasWonder_1 = require("@civ-clone/base-wonder/lib/hasWonder");
// The Statue of Liberty's owner leaves Anarchy at the next turn's start, rather than waiting for a turn that is a
//  multiple of 4 (OpenCiv2 `civ_turn_update_diplomacy`, richardpenman/civ2@49f26ec). The shortest `AnarchyDuration`
//  wins (base-government-change), so this shortens civ2-government's for any cause.
const getRules = (playerResearchRegistry = PlayerResearchRegistry_1.instance, wonderRegistry = WonderRegistry_1.instance, requirementRegistry = RequirementRegistry_1.instance) => [
    new AnarchyDuration_1.default(RuleIds_1.STATUE_OF_LIBERTY_ANARCHY_RULE, new Criterion_1.default((player) => (0, hasWonder_1.playerOwnsWonder)(player, Wonders_1.StatueOfLiberty, wonderRegistry, playerResearchRegistry, requirementRegistry)), new Effect_1.default(() => 1)),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=anarchy-duration.js.map