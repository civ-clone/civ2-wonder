"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wonderHistory = exports.WONDERS_IN_ORIGINAL_ORDER = exports.wonderStatus = exports.everBuilt = void 0;
const CityImprovementRegistry_1 = require("@civ-clone/core-city-improvement/CityImprovementRegistry");
const wonderHistory_1 = require("@civ-clone/base-wonder/lib/wonderHistory");
const WonderRegistry_1 = require("@civ-clone/core-wonder/WonderRegistry");
const wonderTable_1 = require("./wonderTable");
var wonderHistory_2 = require("@civ-clone/base-wonder/lib/wonderHistory");
Object.defineProperty(exports, "everBuilt", { enumerable: true, get: function () { return wonderHistory_2.everBuilt; } });
Object.defineProperty(exports, "wonderStatus", { enumerable: true, get: function () { return wonderHistory_2.wonderStatus; } });
/** Civ2's Wonders in the order of its Wonders of the World report: RULES.TXT's (`wonderTypes`). */
exports.WONDERS_IN_ORIGINAL_ORDER = wonderTable_1.wonderTypes;
/** Every Wonder ever built, standing or lost, in RULES.TXT's order (base-wonder's `wonderHistory`). */
const wonderHistory = (wonderRegistry = WonderRegistry_1.instance, cityImprovementRegistry = CityImprovementRegistry_1.instance) => (0, wonderHistory_1.wonderHistory)(wonderTable_1.wonderTypes, wonderRegistry, cityImprovementRegistry);
exports.wonderHistory = wonderHistory;
exports.default = exports.wonderHistory;
//# sourceMappingURL=wonderHistory.js.map