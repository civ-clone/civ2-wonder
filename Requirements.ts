import { Requirement, table } from '@civ-clone/core-requirement/Requirement';
import { advanceType, wonderRows } from './lib/wonderTable';
import Advance from '@civ-clone/core-science/Advance';
import { WonderRow } from './data/wonders';
import Wonder from '@civ-clone/core-wonder/Wonder';

// What Civilization II's Wonders need and what makes them obsolete, from `data/wonders`, as the entries the rules are
//  made from (base-wonder's `deriveBuildRules` and `deriveObsoleteRules`). `registerRules` adds them to the game's
//  `requirements`, where base-wonder's `isObsolete` reads them.

/** The advance a city's player needs before it can build each Wonder (@IMPROVE column 3): one rule each. */
export const requiresAdvance: Requirement[] = table(
  'civ2-wonder:city/build/requires-advance',
  'requires',
  wonderRows
    .filter(([, [, prerequisite]]) => advanceType(prerequisite) !== null)
    .map(
      ([WonderType, [, prerequisite]]: [typeof Wonder, WonderRow]): [
        typeof Wonder,
        typeof Advance
      ] => [WonderType, advanceType(prerequisite)!]
    )
);

/**
 * The advance whose discovery by *anyone* ends each Wonder's effect (@ENDWONDER; OpenCiv2 `wonder_is_expired` asks
 *  every civilization): one rule each, which announces it the first time.
 */
export const obsoletedBy: Requirement[] = table(
  'civ2-wonder:wonder/obsolete',
  'obsoletedBy',
  wonderRows
    .filter(([, [, , expiresWith]]) => advanceType(expiresWith) !== null)
    .map(
      ([WonderType, [, , expiresWith]]: [typeof Wonder, WonderRow]): [
        typeof Wonder,
        typeof Advance
      ] => [WonderType, advanceType(expiresWith)!]
    ),
  { range: 'world' }
);

export default requiresAdvance;
