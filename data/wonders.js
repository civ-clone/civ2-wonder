"use strict";
// Civilization II's Wonders of the World: the numbers of RULES.TXT @IMPROVE rows 39 to 66 and @ENDWONDER rows 0 to 27,
//  as OpenCiv2 loads them (`src/auto/civ.cpp` `rules_load_improvements`, richardpenman/civ2@49f26ec; the same numbers
//  are baked into `src/game/rules.cpp` `rules_improvements` and `rules_wonder_expires`). Numbers only: no text from the
//  file is held here. `tests/rulesTxt.test.ts` checks every number against a local RULES.TXT when `CIV2_PATH` is set.
//
// Advances are indices into @CIVILIZE (civ2-science's `data/advances`), -1 for `nil` (none).
Object.defineProperty(exports, "__esModule", { value: true });
exports.wonders = exports.NONE = void 0;
exports.NONE = -1;
/** Rows 0 to 27, in `Wonders`' order. */
exports.wonders = [
    // @IMPROVE row 39, @ENDWONDER row 0
    [20, 47, exports.NONE],
    // @IMPROVE row 40, @ENDWONDER row 1
    [20, 65, 67],
    // @IMPROVE row 41, @ENDWONDER row 2
    [20, 8, 30],
    // @IMPROVE row 42, @ENDWONDER row 3
    [20, 46, 45],
    // @IMPROVE row 43, @ENDWONDER row 4
    [30, 43, 23],
    // @IMPROVE row 44, @ENDWONDER row 5
    [30, 56, 82],
    // @IMPROVE row 45, @ENDWONDER row 6
    [30, 47, 51],
    // @IMPROVE row 46, @ENDWONDER row 7
    [30, 29, 53],
    // @IMPROVE row 47, @ENDWONDER row 8
    [30, 25, 37],
    // @IMPROVE row 48, @ENDWONDER row 9
    [20, 84, 15],
    // @IMPROVE row 49, @ENDWONDER row 10
    [40, 55, exports.NONE],
    // @IMPROVE row 50, @ENDWONDER row 11
    [30, 3, exports.NONE],
    // @IMPROVE row 51, @ENDWONDER row 12
    [40, 57, exports.NONE],
    // @IMPROVE row 52, @ENDWONDER row 13
    [30, 50, exports.NONE],
    // @IMPROVE row 53, @ENDWONDER row 14
    [40, 38, 5],
    // @IMPROVE row 54, @ENDWONDER row 15
    [40, 82, exports.NONE],
    // @IMPROVE row 55, @ENDWONDER row 16
    [40, 83, exports.NONE],
    // @IMPROVE row 56, @ENDWONDER row 17
    [40, 22, exports.NONE],
    // @IMPROVE row 57, @ENDWONDER row 18
    [40, 67, exports.NONE],
    // @IMPROVE row 58, @ENDWONDER row 19
    [40, 21, exports.NONE],
    // @IMPROVE row 59, @ENDWONDER row 20
    [30, 78, exports.NONE],
    // @IMPROVE row 60, @ENDWONDER row 21
    [60, 37, exports.NONE],
    // @IMPROVE row 61, @ENDWONDER row 22
    [60, 24, exports.NONE],
    // @IMPROVE row 62, @ENDWONDER row 23
    [60, 58, exports.NONE],
    // @IMPROVE row 63, @ENDWONDER row 24
    [60, 15, exports.NONE],
    // @IMPROVE row 64, @ENDWONDER row 25
    [60, 76, exports.NONE],
    // @IMPROVE row 65, @ENDWONDER row 26
    [60, 16, exports.NONE],
    // @IMPROVE row 66, @ENDWONDER row 27
    [60, 33, exports.NONE],
];
exports.default = exports.wonders;
//# sourceMappingURL=wonders.js.map