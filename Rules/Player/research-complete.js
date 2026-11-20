"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = exports.GREAT_LIBRARY_HOLDERS = void 0;
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const RequirementRegistry_1 = require("@civ-clone/core-requirement/RequirementRegistry");
const WonderRegistry_1 = require("@civ-clone/core-wonder/WonderRegistry");
const leonardo_1 = require("../../lib/leonardo");
const Complete_1 = require("@civ-clone/core-science/Rules/Complete");
const Description_1 = require("@civ-clone/core-rule/Description");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Wonders_1 = require("../../Wonders");
const describedRule_1 = require("../../lib/describedRule");
const greatLibraryRules_1 = require("@civ-clone/base-wonder/lib/greatLibraryRules");
const isBarbarian_1 = require("@civ-clone/base-civilization-barbarian/isBarbarian");
/**
 * The Great Library gives its owner an advance once 2 civilizations have it (OpenCiv2 `civ_give_advance`,
 *  richardpenman/civ2@49f26ec, counts civilizations 1 to 7: never the barbarians).
 */
exports.GREAT_LIBRARY_HOLDERS = 2;
/**
 * Leonardo's Workshop upgrades its owner's units each time they're given an advance, however they got it, before the
 *  Great Library looks at it (OpenCiv2 `civ_give_advance` calls `civ_leonardo_upgrade` just ahead of its Great Library
 *  check). The advance is already theirs, so discovering the one that expires the Wonder upgrades nothing.
 */
const getRules = (playerResearchRegistry = PlayerResearchRegistry_1.instance, wonderRegistry = WonderRegistry_1.instance, requirementRegistry = RequirementRegistry_1.instance, leonardoRegistries = {}) => {
    const upgrade = (0, leonardo_1.default)({
        playerResearchRegistry,
        requirementRegistry,
        wonderRegistry,
        ...leonardoRegistries,
    });
    return [
        new Complete_1.default('civ2-wonder:player/research-complete/leonardos-workshop', new Effect_1.default((playerResearch) => {
            const player = playerResearch.player();
            upgrade(player);
            // The advance taken from a captured city: `city_capture` then runs its own pass (`Rules/City/captured`).
            if ((0, leonardo_1.stolenAdvanceArrived)(player)) {
                upgrade(player);
            }
        }), new Description_1.default({
            type: 'unit_upgrade',
            subject: Wonders_1.LeonardosWorkshop,
            scope: 'player',
        })),
        // base-wonder's rule, saying what it does (civ-clone/web-renderer#1196).
        ...(0, greatLibraryRules_1.greatLibraryRules)({
            GreatLibrary: Wonders_1.GreatLibrary,
            holders: exports.GREAT_LIBRARY_HOLDERS,
            counts: (playerResearch) => !(0, isBarbarian_1.default)(playerResearch.player()),
        }, playerResearchRegistry, wonderRegistry, requirementRegistry).map((rule) => (0, describedRule_1.describedRule)(rule, new Description_1.default({
            type: 'shared_advances',
            subject: Wonders_1.GreatLibrary,
            value: exports.GREAT_LIBRARY_HOLDERS,
        }))),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=research-complete.js.map