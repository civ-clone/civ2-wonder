"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = exports.embassyWonders = exports.MANHATTAN_PROJECT_REPUTATION = exports.EIFFEL_TOWER_ATTITUDE = void 0;
const Wonders_1 = require("../Wonders");
const RuleIds_1 = require("../RuleIds");
const InteractionRegistry_1 = require("@civ-clone/core-diplomacy/InteractionRegistry");
const core_pending_effect_1 = require("@civ-clone/core-pending-effect");
const PlayerRegistry_1 = require("@civ-clone/core-player/PlayerRegistry");
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const RequirementRegistry_1 = require("@civ-clone/core-requirement/RequirementRegistry");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const Turn_1 = require("@civ-clone/core-turn-based-game/Turn");
const WonderRegistry_1 = require("@civ-clone/core-wonder/WonderRegistry");
const relations_1 = require("@civ-clone/civ2-diplomacy/lib/relations");
const hasWonder_1 = require("@civ-clone/base-wonder/lib/hasWonder");
const BulidingComplete_1 = require("@civ-clone/core-city-build/Rules/BulidingComplete");
const Captured_1 = require("@civ-clone/core-city/Rules/Captured");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Description_1 = require("@civ-clone/core-rule/Description");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const HasEmbassy_1 = require("@civ-clone/base-diplomacy/Rules/HasEmbassy");
const isBarbarian_1 = require("@civ-clone/base-civilization-barbarian/isBarbarian");
const Contact_1 = require("@civ-clone/base-diplomacy-interaction-contact/Contact");
const Created_1 = require("@civ-clone/core-diplomacy/Rules/Interaction/Created");
const Low_1 = require("@civ-clone/core-rule/Priorities/Low");
/** How much every other player's attitude to the Eiffel Tower's owner improves (falls) when its effect is applied. */
exports.EIFFEL_TOWER_ATTITUDE = 25;
/** The worst a reputation can be after the Manhattan Project is built (lower is better). */
exports.MANHATTAN_PROJECT_REPUTATION = 6;
/** The wonders that act as an embassy with every other player, for their owner, with the rule that says so. */
exports.embassyWonders = [
    [Wonders_1.MarcoPolosEmbassy, RuleIds_1.MARCO_POLOS_EMBASSY_EMBASSY_RULE],
    [Wonders_1.UnitedNations, RuleIds_1.UNITED_NATIONS_EMBASSY_RULE],
];
/**
 * The diplomatic parts of Civilization II's wonders that aren't in civ2-diplomacy's own formulas (OpenCiv2,
 *  richardpenman/civ2@e39fe7b). civ2-diplomacy reads who owns Marco Polo's, the Great Wall, the United Nations, the
 *  Eiffel Tower and Magellan's Expedition itself, for the talks, the Senate, patience, reputation's recovery and share
 *  maps. Expired wonders count as absent (base-wonder's `playerOwnsWonder`, with civ2-wonder's expiries in the
 *  requirements).
 * - **Marco Polo's Embassy and the United Nations** act as an embassy with every other player for their owner
 *   (base-diplomacy's `HasEmbassy`; they set no `Embassy`, as the original sets no flag). They make no contact.
 * - **The Eiffel Tower** (`civ_apply_eiffel_tower`, `civ.cpp:6794-6812`), once for each player, when it is built or
 *   captured: its owner's reputation is halved (rounded down), every other player's attitude to it falls by 25, and
 *   every vendetta held against it ends. That it was applied is kept as a `PendingEffect` (`EIFFEL_TOWER_APPLIED`) on
 *   the player, which is never discharged, as the original's `CIVF_EIFFEL_APPLIED`. The original lowers every
 *   civilization's attitude, met or not; here an attitude is seeded when a pair meets (civ2-diplomacy), so a player
 *   that meets the owner later has its seeded attitude to it lowered by 25 then (`EIFFEL_TOWER_CONTACT_RULE`, after
 *   the seeding).
 * - **The Manhattan Project** (`city_production.cpp:2435-2438`), when it is built: every player's reputation becomes
 *   (reputation + 1) / 2, rounded down, at most 6.
 *
 * Barbarians take no part.
 */
const getRules = ({ interactionRegistry = InteractionRegistry_1.instance, pendingEffectRegistry = core_pending_effect_1.instance, playerRegistry = PlayerRegistry_1.instance, playerResearchRegistry = PlayerResearchRegistry_1.instance, requirementRegistry = RequirementRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance, turn = Turn_1.instance, wonderRegistry = WonderRegistry_1.instance, } = {}) => {
    const relations = { interactionRegistry, ruleRegistry, turn }, others = (player) => playerRegistry
        .entries()
        .filter((other) => other !== player && !(0, isBarbarian_1.default)(other)), applied = (player) => pendingEffectRegistry
        .getByTarget(player)
        .some((pendingEffect) => pendingEffect.handler() === RuleIds_1.EIFFEL_TOWER_APPLIED), applyEiffelTower = (player) => {
        if ((0, isBarbarian_1.default)(player) || applied(player)) {
            return;
        }
        pendingEffectRegistry.register(new core_pending_effect_1.PendingEffect(RuleIds_1.EIFFEL_TOWER_APPLIED, player));
        const reputations = (0, relations_1.reputation)(relations), attitudes = (0, relations_1.attitude)(relations);
        reputations.set(player, Math.floor(reputations.get(player) / 2), 'eiffel-tower');
        others(player).forEach((other) => {
            // An attitude is seeded when a pair meets (civ2-diplomacy), so only those that have met have one to change.
            if (attitudes.get(other, player) !== undefined) {
                attitudes.adjust(other, player, -exports.EIFFEL_TOWER_ATTITUDE, 'eiffel-tower');
            }
        });
        (0, relations_1.clearVendettasAgainst)(player, interactionRegistry);
    }, built = (WonderType) => (cityBuild, item) => item instanceof WonderType, holds = (WonderType) => (0, hasWonder_1.cityHasWonder)(WonderType, wonderRegistry, playerResearchRegistry, requirementRegistry);
    return [
        ...exports.embassyWonders.map(([WonderType, id]) => new HasEmbassy_1.default(id, new Effect_1.default((player, other) => player !== other &&
            (0, hasWonder_1.playerOwnsWonder)(player, WonderType, wonderRegistry, playerResearchRegistry, requirementRegistry)), new Description_1.default({ type: 'embassy_with_all', subject: WonderType }))),
        new BulidingComplete_1.default(RuleIds_1.EIFFEL_TOWER_COMPLETE_RULE, new Criterion_1.default(built(Wonders_1.EiffelTower)), new Effect_1.default((cityBuild) => applyEiffelTower(cityBuild.city().player())), new Description_1.default(
        // The same as its owner captures it (`EIFFEL_TOWER_CAPTURED_RULE`), and the attitude too as a player meets it
        //  later (`EIFFEL_TOWER_CONTACT_RULE`).
        { type: 'reputation_halved', subject: Wonders_1.EiffelTower }, {
            type: 'attitude_improved',
            subject: Wonders_1.EiffelTower,
            value: exports.EIFFEL_TOWER_ATTITUDE,
        }, { type: 'vendettas_end', subject: Wonders_1.EiffelTower })),
        // A pair meeting after the Eiffel Tower's effect was applied to one of them: the other likes it 25 better, as it
        //  would have had their attitudes been kept before they met. `Low`, so after civ2-diplomacy seeds them.
        new Created_1.default(RuleIds_1.EIFFEL_TOWER_CONTACT_RULE, new Low_1.default(), new Criterion_1.default((interaction) => interaction instanceof Contact_1.default), new Effect_1.default((interaction) => {
            const [player, other] = interaction.players();
            if (player === undefined || other === undefined || player === other) {
                return;
            }
            const attitudes = (0, relations_1.attitude)(relations);
            [
                [player, other],
                [other, player],
            ].forEach(([holder, toward]) => {
                if (applied(toward) &&
                    !(0, isBarbarian_1.default)(holder) &&
                    attitudes.get(holder, toward) !== undefined) {
                    attitudes.adjust(holder, toward, -exports.EIFFEL_TOWER_ATTITUDE, 'eiffel-tower');
                }
            });
        })),
        // `city_capture_aftermath` (`city.cpp:4919-4921`): the captor of the Eiffel Tower's city gets its effect, once.
        new Captured_1.default(RuleIds_1.EIFFEL_TOWER_CAPTURED_RULE, holds(Wonders_1.EiffelTower), new Effect_1.default((city, captor) => applyEiffelTower(captor))),
        new BulidingComplete_1.default(RuleIds_1.MANHATTAN_PROJECT_COMPLETE_RULE, new Criterion_1.default(built(Wonders_1.ManhattanProject)), new Effect_1.default(() => {
            const reputations = (0, relations_1.reputation)(relations);
            playerRegistry
                .entries()
                .filter((player) => !(0, isBarbarian_1.default)(player))
                .forEach((player) => {
                reputations.set(player, Math.min(exports.MANHATTAN_PROJECT_REPUTATION, Math.max(0, Math.floor((reputations.get(player) + 1) / 2))), 'manhattan-project');
            });
        }), new Description_1.default({
            type: 'reputation_recovers',
            subject: Wonders_1.ManhattanProject,
            value: exports.MANHATTAN_PROJECT_REPUTATION,
            scope: 'world',
        })),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=diplomacy.js.map