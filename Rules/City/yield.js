"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = exports.cureForCancerHappy = exports.hangingGardensCityHappy = exports.hangingGardensHappy = void 0;
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const RequirementRegistry_1 = require("@civ-clone/core-requirement/RequirementRegistry");
const WonderRegistry_1 = require("@civ-clone/core-wonder/WonderRegistry");
const Wonders_1 = require("../../Wonders");
const hasWonder_1 = require("@civ-clone/base-wonder/lib/hasWonder");
const Yield_1 = require("@civ-clone/core-city/Rules/Yield");
const Description_1 = require("@civ-clone/core-rule/Description");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Happiness_1 = require("@civ-clone/base-city-yield-happiness/Happiness");
// OpenCiv2 `city_calc_trade_happiness` (richardpenman/civ2@49f26ec): the Hanging Gardens make 1 citizen happy in each
//  of their owner's cities and 2 more in their own; the Cure for Cancer 1 in each of its owner's cities. Each Wonder
//  stops once it's obsolete or its city is lost (base-wonder's `cityHasWonder` and `playerHasWonder`). The Colossus and
//  King Richard's Crusade work per square (`Rules/City/tile-yield`).
// The citizens each Wonder makes happy, read by its rule and by what the rule says it does (civ-clone/web-renderer#1196).
exports.hangingGardensHappy = 1, exports.hangingGardensCityHappy = 2, exports.cureForCancerHappy = 1;
const getRules = ({ playerResearchRegistry = PlayerResearchRegistry_1.instance, requirementRegistry = RequirementRegistry_1.instance, wonderRegistry = WonderRegistry_1.instance, } = {}) => [
    new Yield_1.default('civ2-wonder:city/yield/hanging-gardens', (0, hasWonder_1.playerHasWonder)(Wonders_1.HangingGardens, wonderRegistry, playerResearchRegistry, requirementRegistry), new Effect_1.default(() => new Happiness_1.default(exports.hangingGardensHappy, Wonders_1.HangingGardens.name)), new Description_1.default({
        type: 'happy',
        subject: Wonders_1.HangingGardens,
        value: exports.hangingGardensHappy,
        scope: 'player',
    })),
    new Yield_1.default('civ2-wonder:city/yield/hanging-gardens-city', (0, hasWonder_1.cityHasWonder)(Wonders_1.HangingGardens, wonderRegistry, playerResearchRegistry, requirementRegistry), new Effect_1.default(() => new Happiness_1.default(exports.hangingGardensCityHappy, Wonders_1.HangingGardens.name)), new Description_1.default({
        type: 'happy',
        subject: Wonders_1.HangingGardens,
        value: exports.hangingGardensCityHappy,
        step: 'more',
    })),
    new Yield_1.default('civ2-wonder:city/yield/cure-for-cancer', (0, hasWonder_1.playerHasWonder)(Wonders_1.CureForCancer, wonderRegistry, playerResearchRegistry, requirementRegistry), new Effect_1.default(() => new Happiness_1.default(exports.cureForCancerHappy, Wonders_1.CureForCancer.name)), new Description_1.default({
        type: 'happy',
        subject: Wonders_1.CureForCancer,
        value: exports.cureForCancerHappy,
        scope: 'player',
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=yield.js.map