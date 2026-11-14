"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obsoletedBy = exports.requiresAdvance = void 0;
const Requirement_1 = require("@civ-clone/core-requirement/Requirement");
const wonderTable_1 = require("./lib/wonderTable");
// What Civilization II's Wonders need and what makes them obsolete, from `data/wonders`, as the entries the rules are
//  made from (base-wonder's `deriveBuildRules` and `deriveObsoleteRules`). `registerRules` adds them to the game's
//  `requirements`, where base-wonder's `isObsolete` reads them.
/** The advance a city's player needs before it can build each Wonder (@IMPROVE column 3): one rule each. */
exports.requiresAdvance = (0, Requirement_1.table)('civ2-wonder:city/build/requires-advance', 'requires', wonderTable_1.wonderRows
    .filter(([, [, prerequisite]]) => (0, wonderTable_1.advanceType)(prerequisite) !== null)
    .map(([WonderType, [, prerequisite]]) => [WonderType, (0, wonderTable_1.advanceType)(prerequisite)]));
/**
 * The advance whose discovery by *anyone* ends each Wonder's effect (@ENDWONDER; OpenCiv2 `wonder_is_expired` asks
 *  every civilization): one rule each, which announces it the first time.
 */
exports.obsoletedBy = (0, Requirement_1.table)('civ2-wonder:wonder/obsolete', 'obsoletedBy', wonderTable_1.wonderRows
    .filter(([, [, , expiresWith]]) => (0, wonderTable_1.advanceType)(expiresWith) !== null)
    .map(([WonderType, [, , expiresWith]]) => [WonderType, (0, wonderTable_1.advanceType)(expiresWith)]), { range: 'world' });
exports.default = exports.requiresAdvance;
//# sourceMappingURL=Requirements.js.map