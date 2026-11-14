"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Wonders_1 = require("../../Wonders");
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const RequirementRegistry_1 = require("@civ-clone/core-requirement/RequirementRegistry");
const WonderRegistry_1 = require("@civ-clone/core-wonder/WonderRegistry");
const traits_1 = require("@civ-clone/core-unit/traits");
const CoastBound_1 = require("@civ-clone/base-unit-trait-coast-bound/CoastBound");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Priorities_1 = require("@civ-clone/core-rule/Priorities");
const Yields_1 = require("@civ-clone/core-unit/Yields");
const Naval_1 = require("@civ-clone/base-unit-type-naval/Naval");
const Yield_1 = require("@civ-clone/core-unit/Rules/Yield");
const hasWonder_1 = require("@civ-clone/base-wonder/lib/hasWonder");
// OpenCiv2 `unit_max_moves` (richardpenman/civ2@49f26ec), for a sea unit, in whole moves (the game counts in thirds):
//  Magellan's Expedition gives 2 more, and the Lighthouse 1 more to one that isn't coast-bound.
const getRules = (wonderRegistry = WonderRegistry_1.instance, playerResearchRegistry = PlayerResearchRegistry_1.instance, requirementRegistry = RequirementRegistry_1.instance) => {
    const isMovement = new Criterion_1.default((unit, unitYield) => unitYield instanceof Yields_1.Movement), isNaval = new Criterion_1.default((unit) => (0, traits_1.isA)(unit, Naval_1.default));
    return [
        new Yield_1.default('civ2-wonder:unit/yield/lighthouse', new Priorities_1.Low(), isMovement, isNaval, new Criterion_1.default((unit) => !unit.hasTrait(CoastBound_1.default)), (0, hasWonder_1.playerHasWonder)(Wonders_1.Lighthouse, wonderRegistry, playerResearchRegistry, requirementRegistry), new Effect_1.default((unit, unitYield) => unitYield.add(1))),
        new Yield_1.default('civ2-wonder:unit/yield/magellans-expedition', new Priorities_1.Low(), isMovement, isNaval, (0, hasWonder_1.playerHasWonder)(Wonders_1.MagellansExpedition, wonderRegistry, playerResearchRegistry, requirementRegistry), new Effect_1.default((unit, unitYield) => unitYield.add(2))),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=yield.js.map