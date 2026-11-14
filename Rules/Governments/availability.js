"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = exports.statueOfLibertyGovernments = void 0;
const Governments_1 = require("@civ-clone/civ2-government/Governments");
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const RequirementRegistry_1 = require("@civ-clone/core-requirement/RequirementRegistry");
const WonderRegistry_1 = require("@civ-clone/core-wonder/WonderRegistry");
const Availability_1 = require("@civ-clone/core-government/Rules/Availability");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const RuleIds_1 = require("../../RuleIds");
const Wonders_1 = require("../../Wonders");
const hasWonder_1 = require("@civ-clone/base-wonder/lib/hasWonder");
/** Every government but Anarchy (Despotism is always offered anyway). */
exports.statueOfLibertyGovernments = [
    Governments_1.Monarchy,
    Governments_1.Communism,
    Governments_1.Fundamentalism,
    Governments_1.Republic,
    Governments_1.Democracy,
];
// The Statue of Liberty's owner may choose any government, whichever advances they have (OpenCiv2
//  `civ_can_choose_government`, richardpenman/civ2@49f26ec). A government is offered if any `Availability` rule allows
//  it, so this is one more way to each, beside civ2-government's.
const getRules = (playerResearchRegistry = PlayerResearchRegistry_1.instance, wonderRegistry = WonderRegistry_1.instance, requirementRegistry = RequirementRegistry_1.instance) => [
    new Availability_1.default(RuleIds_1.STATUE_OF_LIBERTY_AVAILABILITY_RULE, new Criterion_1.default((GovernmentType) => exports.statueOfLibertyGovernments.includes(GovernmentType)), new Criterion_1.default((GovernmentType, player) => (0, hasWonder_1.playerOwnsWonder)(player, Wonders_1.StatueOfLiberty, wonderRegistry, playerResearchRegistry, requirementRegistry))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=availability.js.map