"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wonderRows = exports.advanceType = exports.wonderTypes = void 0;
const Wonders_1 = require("../Wonders");
const wonders_1 = require("../data/wonders");
const advanceIndex_1 = require("@civ-clone/civ2-science/lib/advanceIndex");
/**
 * The Wonders in RULES.TXT's order (`data/wonders`' rows; OpenCiv2's `WONDER_*` indices), which is also the order of
 *  the Wonders of the World report.
 */
exports.wonderTypes = [
    Wonders_1.Pyramids,
    Wonders_1.HangingGardens,
    Wonders_1.Colossus,
    Wonders_1.Lighthouse,
    Wonders_1.GreatLibrary,
    Wonders_1.Oracle,
    Wonders_1.GreatWall,
    Wonders_1.SunTzusWarAcademy,
    Wonders_1.KingRichardsCrusade,
    Wonders_1.MarcoPolosEmbassy,
    Wonders_1.MichelangelosChapel,
    Wonders_1.CopernicusObservatory,
    Wonders_1.MagellansExpedition,
    Wonders_1.ShakespearesTheatre,
    Wonders_1.LeonardosWorkshop,
    Wonders_1.JsBachsCathedral,
    Wonders_1.IsaacNewtonsCollege,
    Wonders_1.AdamSmithsTradingCompany,
    Wonders_1.DarwinsVoyage,
    Wonders_1.StatueOfLiberty,
    Wonders_1.EiffelTower,
    Wonders_1.WomensSuffrage,
    Wonders_1.HooverDam,
    Wonders_1.ManhattanProject,
    Wonders_1.UnitedNations,
    Wonders_1.ApolloProgram,
    Wonders_1.SetiProgram,
    Wonders_1.CureForCancer,
];
/** The advance at a @CIVILIZE index, or `null` for `nil`. */
const advanceType = (index) => index === wonders_1.NONE ? null : (0, advanceIndex_1.advanceAt)(index);
exports.advanceType = advanceType;
/** Each Wonder with its row. */
exports.wonderRows = exports.wonderTypes.map((WonderType, index) => [
    WonderType,
    wonders_1.wonders[index],
]);
exports.default = exports.wonderTypes;
//# sourceMappingURL=wonderTable.js.map