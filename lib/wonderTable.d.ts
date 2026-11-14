import { WonderRow } from '../data/wonders';
import Advance from '@civ-clone/core-science/Advance';
import Wonder from '@civ-clone/core-wonder/Wonder';
/**
 * The Wonders in RULES.TXT's order (`data/wonders`' rows; OpenCiv2's `WONDER_*` indices), which is also the order of
 *  the Wonders of the World report.
 */
export declare const wonderTypes: (typeof Wonder)[];
/** The advance at a @CIVILIZE index, or `null` for `nil`. */
export declare const advanceType: (index: number) => typeof Advance | null;
/** Each Wonder with its row. */
export declare const wonderRows: [typeof Wonder, WonderRow][];
export default wonderTypes;
