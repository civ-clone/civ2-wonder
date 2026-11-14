export declare const NONE = -1;
export type WonderRow = [
  cost: number,
  prerequisite: number,
  expiresWith: number
];
/** Rows 0 to 27, in `Wonders`' order. */
export declare const wonders: WonderRow[];
export default wonders;
