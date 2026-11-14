import { Requirement } from '@civ-clone/core-requirement/Requirement';
/** The advance a city's player needs before it can build each Wonder (@IMPROVE column 3): one rule each. */
export declare const requiresAdvance: Requirement[];
/**
 * The advance whose discovery by *anyone* ends each Wonder's effect (@ENDWONDER; OpenCiv2 `wonder_is_expired` asks
 *  every civilization): one rule each, which announces it the first time.
 */
export declare const obsoletedBy: Requirement[];
export default requiresAdvance;
