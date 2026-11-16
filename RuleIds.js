"use strict";
// The ids of this package's rules that another package is expected to name.
Object.defineProperty(exports, "__esModule", { value: true });
exports.MANHATTAN_PROJECT_COMPLETE_RULE = exports.EIFFEL_TOWER_APPLIED = exports.EIFFEL_TOWER_CONTACT_RULE = exports.EIFFEL_TOWER_CAPTURED_RULE = exports.EIFFEL_TOWER_COMPLETE_RULE = exports.UNITED_NATIONS_EMBASSY_RULE = exports.MARCO_POLOS_EMBASSY_EMBASSY_RULE = exports.STATUE_OF_LIBERTY_ANARCHY_RULE = exports.STATUE_OF_LIBERTY_AVAILABILITY_RULE = exports.DARWINS_VOYAGE = void 0;
/** The handler that Darwin's Voyage's owed research completions are saved under. */
exports.DARWINS_VOYAGE = 'civ2-wonder:darwins-voyage';
/** Any government, for the Statue of Liberty's owner. */
exports.STATUE_OF_LIBERTY_AVAILABILITY_RULE = 'civ2-wonder:governments/availability/statue-of-liberty';
/** Anarchy ends at the next turn's start, for the Statue of Liberty's owner. */
exports.STATUE_OF_LIBERTY_ANARCHY_RULE = 'civ2-wonder:player/anarchy-duration/statue-of-liberty';
/** Marco Polo's Embassy acts as an embassy with every other player for its owner (base-diplomacy's `HasEmbassy`). */
exports.MARCO_POLOS_EMBASSY_EMBASSY_RULE = 'civ2-wonder:player/has-embassy/marco-polos-embassy';
/** The United Nations acts as an embassy with every other player for its owner (base-diplomacy's `HasEmbassy`). */
exports.UNITED_NATIONS_EMBASSY_RULE = 'civ2-wonder:player/has-embassy/united-nations';
/** The Eiffel Tower's effect on its builder's reputation, the others' attitudes and their vendettas. */
exports.EIFFEL_TOWER_COMPLETE_RULE = 'civ2-wonder:city/building-complete/eiffel-tower';
/** The same for its captor, once for each player. */
exports.EIFFEL_TOWER_CAPTURED_RULE = 'civ2-wonder:city/captured/eiffel-tower';
/** A player that meets the Eiffel Tower's owner after its effect was applied likes it 25 better. */
exports.EIFFEL_TOWER_CONTACT_RULE = 'civ2-wonder:interaction/created/eiffel-tower';
/** The `PendingEffect` handler key that marks a player the Eiffel Tower's effect has been applied to (never discharged). */
exports.EIFFEL_TOWER_APPLIED = 'civ2-wonder:eiffel-tower-applied';
/** The Manhattan Project's effect on every player's reputation. */
exports.MANHATTAN_PROJECT_COMPLETE_RULE = 'civ2-wonder:city/building-complete/manhattan-project';
//# sourceMappingURL=RuleIds.js.map