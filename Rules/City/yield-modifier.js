"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = exports.copernicusShare = void 0;
const Wonders_1 = require("../../Wonders");
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const RequirementRegistry_1 = require("@civ-clone/core-requirement/RequirementRegistry");
const WonderRegistry_1 = require("@civ-clone/core-wonder/WonderRegistry");
const Description_1 = require("@civ-clone/core-rule/Description");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Priority_1 = require("@civ-clone/core-rule/Priority");
const Research_1 = require("@civ-clone/base-city-yield-research/Research");
const YieldModifier_1 = require("@civ-clone/core-city/Rules/YieldModifier");
const hasWonder_1 = require("@civ-clone/base-wonder/lib/hasWonder");
const reduceYields_1 = require("@civ-clone/core-yield/lib/reduceYields");
// OpenCiv2 `city_split_trade` (richardpenman/civ2@49f26ec): the Copernicus Observatory doubles its city's science,
//  after every other bonus (`X Low`). Isaac Newton's College is part of the science buildings' bonus, which is
//  civ2-city-improvement's (`lib/bonus`), so it isn't here.
/** The share of its city's science the Copernicus Observatory adds, of the total so far: all of it again. */
exports.copernicusShare = 1;
const getRules = ({ playerResearchRegistry = PlayerResearchRegistry_1.instance, requirementRegistry = RequirementRegistry_1.instance, wonderRegistry = WonderRegistry_1.instance, } = {}) => [
    new YieldModifier_1.default('civ2-wonder:city/yield-modifier/copernicus-observatory', new Priority_1.default(4000), // X Low: after every `Low` modifier
    (0, hasWonder_1.cityHasWonder)(Wonders_1.CopernicusObservatory, wonderRegistry, playerResearchRegistry, requirementRegistry), new Effect_1.default((city, yields) => new Research_1.default((0, reduceYields_1.reduceYield)(yields, Research_1.default) * exports.copernicusShare, Wonders_1.CopernicusObservatory.name)), new Description_1.default({
        type: 'yield_percent',
        subject: Wonders_1.CopernicusObservatory,
        yield: Research_1.default,
        value: exports.copernicusShare,
        of: 'total',
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=yield-modifier.js.map