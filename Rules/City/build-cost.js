"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const BuildCost_1 = require("@civ-clone/core-city-build/Rules/BuildCost");
const cosmic_1 = require("@civ-clone/civ2-rules/data/cosmic");
const wonderTable_1 = require("../../lib/wonderTable");
/** Each Wonder's cost in shields: @IMPROVE column 1's rows of shields, times @COSMIC's shield box rows (10). */
const getRules = () => wonderTable_1.wonderRows.flatMap(([WonderType, [cost]]) => (0, BuildCost_1.buildCost)(WonderType, cost * cosmic_1.cosmic.shieldBoxRows, 'civ2-wonder:city/build-cost'));
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=build-cost.js.map