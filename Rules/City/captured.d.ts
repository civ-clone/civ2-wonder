import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { LeonardoRegistries } from '../../lib/leonardo';
import Captured from '@civ-clone/core-city/Rules/Captured';
/** civ2-science's rule that takes an advance from a captured city, whose captor's client chooses it. */
export declare const STEAL_ADVANCE_RULE =
  'civ2-science:city/captured/steal-advance';
export declare const getRules: (
  registries?: LeonardoRegistries,
  ruleRegistry?: RuleRegistry
) => Captured[];
export default getRules;
