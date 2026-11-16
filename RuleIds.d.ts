/** The handler that Darwin's Voyage's owed research completions are saved under. */
export declare const DARWINS_VOYAGE = 'civ2-wonder:darwins-voyage';
/** Any government, for the Statue of Liberty's owner. */
export declare const STATUE_OF_LIBERTY_AVAILABILITY_RULE =
  'civ2-wonder:governments/availability/statue-of-liberty';
/** Anarchy ends at the next turn's start, for the Statue of Liberty's owner. */
export declare const STATUE_OF_LIBERTY_ANARCHY_RULE =
  'civ2-wonder:player/anarchy-duration/statue-of-liberty';
/** Marco Polo's Embassy acts as an embassy with every other player for its owner (base-diplomacy's `HasEmbassy`). */
export declare const MARCO_POLOS_EMBASSY_EMBASSY_RULE =
  'civ2-wonder:player/has-embassy/marco-polos-embassy';
/** The United Nations acts as an embassy with every other player for its owner (base-diplomacy's `HasEmbassy`). */
export declare const UNITED_NATIONS_EMBASSY_RULE =
  'civ2-wonder:player/has-embassy/united-nations';
/** Marco Polo's Embassy's builder makes contact with every other player. */
export declare const MARCO_POLOS_EMBASSY_COMPLETE_RULE =
  'civ2-wonder:city/building-complete/marco-polos-embassy';
/** The United Nations' builder makes contact with every other player. */
export declare const UNITED_NATIONS_COMPLETE_RULE =
  'civ2-wonder:city/building-complete/united-nations';
/** Marco Polo's Embassy's captor makes contact with every other player. */
export declare const MARCO_POLOS_EMBASSY_CAPTURED_RULE =
  'civ2-wonder:city/captured/marco-polos-embassy';
/** The United Nations' captor makes contact with every other player. */
export declare const UNITED_NATIONS_CAPTURED_RULE =
  'civ2-wonder:city/captured/united-nations';
/** The Eiffel Tower's effect on its builder's reputation, the others' attitudes and their vendettas. */
export declare const EIFFEL_TOWER_COMPLETE_RULE =
  'civ2-wonder:city/building-complete/eiffel-tower';
/** The same for its captor, once for each player. */
export declare const EIFFEL_TOWER_CAPTURED_RULE =
  'civ2-wonder:city/captured/eiffel-tower';
/** The `PendingEffect` handler key that marks a player the Eiffel Tower's effect has been applied to (never discharged). */
export declare const EIFFEL_TOWER_APPLIED = 'civ2-wonder:eiffel-tower-applied';
/** The Manhattan Project's effect on every player's reputation. */
export declare const MANHATTAN_PROJECT_COMPLETE_RULE =
  'civ2-wonder:city/building-complete/manhattan-project';
