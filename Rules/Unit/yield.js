"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = exports.magellansMoves = exports.lighthouseMoves = exports.BEFORE_DAMAGE = void 0;
const Wonders_1 = require("../../Wonders");
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const RequirementRegistry_1 = require("@civ-clone/core-requirement/RequirementRegistry");
const WonderRegistry_1 = require("@civ-clone/core-wonder/WonderRegistry");
const traits_1 = require("@civ-clone/core-unit/traits");
const CoastBound_1 = require("@civ-clone/base-unit-trait-coast-bound/CoastBound");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Description_1 = require("@civ-clone/core-rule/Description");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Priority_1 = require("@civ-clone/core-rule/Priority");
const Yields_1 = require("@civ-clone/core-unit/Yields");
const Naval_1 = require("@civ-clone/base-unit-type-naval/Naval");
const Yield_1 = require("@civ-clone/core-unit/Rules/Yield");
const hasWonder_1 = require("@civ-clone/base-wonder/lib/hasWonder");
// OpenCiv2 `unit_max_moves` (richardpenman/civ2@49f26ec), for a sea unit, in whole moves (the game counts in thirds):
//  Magellan's Expedition gives 2 more, and the Lighthouse 1 more to one that isn't coast-bound. Both come before a
//  damaged ship's moves are cut (civ2-unit's `Low` damaged-movement rule), as in the original, whichever package is
//  loaded first: they run at `BEFORE_DAMAGE`, between the `Normal` rules that set movement and the `Low` ones.
exports.BEFORE_DAMAGE = 2500;
/** The moves each Wonder adds, read by its rule and by what it says it does (civ-clone/web-renderer#1196). */
exports.lighthouseMoves = 1, exports.magellansMoves = 2;
const getRules = (wonderRegistry = WonderRegistry_1.instance, playerResearchRegistry = PlayerResearchRegistry_1.instance, requirementRegistry = RequirementRegistry_1.instance) => {
    const isMovement = new Criterion_1.default((unit, unitYield) => unitYield instanceof Yields_1.Movement), isNaval = new Criterion_1.default((unit) => (0, traits_1.isA)(unit, Naval_1.default));
    return [
        new Yield_1.default('civ2-wonder:unit/yield/lighthouse', new Priority_1.default(exports.BEFORE_DAMAGE), isMovement, isNaval, new Criterion_1.default((unit) => !unit.hasTrait(CoastBound_1.default)), (0, hasWonder_1.playerHasWonder)(Wonders_1.Lighthouse, wonderRegistry, playerResearchRegistry, requirementRegistry), new Effect_1.default((unit, unitYield) => unitYield.add(exports.lighthouseMoves)), new Description_1.default({
            type: 'unit_movement',
            subject: Wonders_1.Lighthouse,
            unit: Naval_1.default,
            value: exports.lighthouseMoves,
            notFor: CoastBound_1.default,
            scope: 'player',
        })),
        new Yield_1.default('civ2-wonder:unit/yield/magellans-expedition', new Priority_1.default(exports.BEFORE_DAMAGE), isMovement, isNaval, (0, hasWonder_1.playerHasWonder)(Wonders_1.MagellansExpedition, wonderRegistry, playerResearchRegistry, requirementRegistry), new Effect_1.default((unit, unitYield) => unitYield.add(exports.magellansMoves)), new Description_1.default({
            type: 'unit_movement',
            subject: Wonders_1.MagellansExpedition,
            unit: Naval_1.default,
            value: exports.magellansMoves,
            scope: 'player',
        })),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=yield.js.map