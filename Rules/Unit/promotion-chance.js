"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const RequirementRegistry_1 = require("@civ-clone/core-requirement/RequirementRegistry");
const WonderRegistry_1 = require("@civ-clone/core-wonder/WonderRegistry");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Rules_1 = require("@civ-clone/base-unit-veteran-promotion/lib/Rules");
const Wonders_1 = require("../../Wonders");
const hasWonder_1 = require("@civ-clone/base-wonder/lib/hasWonder");
/**
 * Sun Tzu's War Academy: every unit of its owner that wins a battle becomes a veteran (OpenCiv2
 *  `unit_resolve_attack_veterans`, richardpenman/civ2@49f26ec, asks `civ_has_wonder` for the winner's civilization),
 *  while the Wonder stands and isn't obsolete. A missile still never does: civ2-unit's promotion rule leaves it out
 *  before the chance is asked.
 */
const getRules = (wonderRegistry = WonderRegistry_1.instance, playerResearchRegistry = PlayerResearchRegistry_1.instance, requirementRegistry = RequirementRegistry_1.instance) => [
    new Rules_1.PromotionChance('civ2-wonder:unit/promotion-chance/sun-tzus-war-academy', new Criterion_1.default((winner) => (0, hasWonder_1.playerOwnsWonder)(winner.player(), Wonders_1.SunTzusWarAcademy, wonderRegistry, playerResearchRegistry, requirementRegistry)), new Effect_1.default(() => 1)),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=promotion-chance.js.map