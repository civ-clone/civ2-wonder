"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = exports.STEAL_ADVANCE_RULE = void 0;
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const leonardo_1 = require("../../lib/leonardo");
const Captured_1 = require("@civ-clone/core-city/Rules/Captured");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Wonders_1 = require("../../Wonders");
const hasWonder_1 = require("@civ-clone/base-wonder/lib/hasWonder");
/** civ2-science's rule that takes an advance from a captured city, whose captor's client chooses it. */
exports.STEAL_ADVANCE_RULE = 'civ2-science:city/captured/steal-advance';
// OpenCiv2 `city_capture_aftermath` (`src/auto/city.cpp`, richardpenman/civ2@49f26ec): the city is already the captor's
//  (line 4991); `civ_steal_advance` (5525) gives the captor an advance through `civ_give_advance`, which runs
//  `civ_leonardo_upgrade` once; then, when the city is Leonardo's Workshop's (`wonder_get_city`, so not once it has
//  expired), it runs again for the captor (5542). Here the steal waits for the captor's client to choose
//  (civ2-science's rule awaits `takeAdvance`), so the advance arrives after every `Captured` rule has run. When the
//  steal will happen, this pass waits for that advance and runs straight after its own pass
//  (`Rules/Player/research-complete`), so a unit can still go two steps, as in the original.
const getRules = (registries = {}, ruleRegistry = RuleRegistry_1.instance) => {
    const upgrade = (0, leonardo_1.default)(registries), stealing = (city, captor, player, cause) => ruleRegistry
        .get(Captured_1.default)
        .some((rule) => rule.id() === exports.STEAL_ADVANCE_RULE &&
        rule.validate(city, captor, player, cause));
    return [
        new Captured_1.default('civ2-wonder:city/captured/leonardos-workshop', (0, hasWonder_1.cityHasWonder)(Wonders_1.LeonardosWorkshop, registries.wonderRegistry, registries.playerResearchRegistry, registries.requirementRegistry), new Effect_1.default((city, captor, player, cause) => {
            if (stealing(city, captor, player, cause)) {
                (0, leonardo_1.afterStolenAdvance)(captor);
                return;
            }
            upgrade(captor);
        })),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=captured.js.map