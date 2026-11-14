import {
  BuildCost,
  buildCost,
} from '@civ-clone/core-city-build/Rules/BuildCost';
import { WonderRow } from '../../data/wonders';
import Buildable from '@civ-clone/core-city-build/Buildable';
import Wonder from '@civ-clone/core-wonder/Wonder';
import { cosmic } from '@civ-clone/civ2-rules/data/cosmic';
import { wonderRows } from '../../lib/wonderTable';

/** Each Wonder's cost in shields: @IMPROVE column 1's rows of shields, times @COSMIC's shield box rows (10). */
export const getRules = (): BuildCost[] =>
  wonderRows.flatMap(
    ([WonderType, [cost]]: [typeof Wonder, WonderRow]): BuildCost[] =>
      buildCost(
        WonderType as unknown as typeof Buildable,
        cost * cosmic.shieldBoxRows,
        'civ2-wonder:city/build-cost'
      )
  );

export default getRules;
