// The ids of this package's rules that another package is expected to name.

/** The handler that Darwin's Voyage's owed research completions are saved under. */
export const DARWINS_VOYAGE = 'civ2-wonder:darwins-voyage';

/** Any government, for the Statue of Liberty's owner. */
export const STATUE_OF_LIBERTY_AVAILABILITY_RULE =
  'civ2-wonder:governments/availability/statue-of-liberty';

/** Anarchy ends at the next turn's start, for the Statue of Liberty's owner. */
export const STATUE_OF_LIBERTY_ANARCHY_RULE =
  'civ2-wonder:player/anarchy-duration/statue-of-liberty';

/** Marco Polo's Embassy acts as an embassy with every other player for its owner (base-diplomacy's `HasEmbassy`). */
export const MARCO_POLOS_EMBASSY_EMBASSY_RULE =
  'civ2-wonder:player/has-embassy/marco-polos-embassy';

/** The United Nations acts as an embassy with every other player for its owner (base-diplomacy's `HasEmbassy`). */
export const UNITED_NATIONS_EMBASSY_RULE =
  'civ2-wonder:player/has-embassy/united-nations';

/** The Eiffel Tower's effect on its builder's reputation, the others' attitudes and their vendettas. */
export const EIFFEL_TOWER_COMPLETE_RULE =
  'civ2-wonder:city/building-complete/eiffel-tower';

/** The same for its captor, once for each player. */
export const EIFFEL_TOWER_CAPTURED_RULE =
  'civ2-wonder:city/captured/eiffel-tower';

/** A player that meets the Eiffel Tower's owner after its effect was applied likes it 25 better. */
export const EIFFEL_TOWER_CONTACT_RULE =
  'civ2-wonder:interaction/created/eiffel-tower';

/** The `PendingEffect` handler key that marks a player the Eiffel Tower's effect has been applied to (never discharged). */
export const EIFFEL_TOWER_APPLIED = 'civ2-wonder:eiffel-tower-applied';

/** The Manhattan Project's effect on every player's reputation. */
export const MANHATTAN_PROJECT_COMPLETE_RULE =
  'civ2-wonder:city/building-complete/manhattan-project';
