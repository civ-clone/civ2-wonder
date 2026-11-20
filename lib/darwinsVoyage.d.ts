import { PendingEffectRegistry } from '@civ-clone/core-pending-effect';
import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import BuildingComplete from '@civ-clone/core-city-build/Rules/BulidingComplete';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import Started from '@civ-clone/core-science/Rules/Started';
/** The research Darwin's Voyage completes, read by its rule and by what it says it does (civ-clone/web-renderer#1196). */
export declare const DARWINS_VOYAGE_ADVANCES: number;
/** `civ_research_complete`: the advance being researched is given, and the progress towards research is 0 after. */
export declare const completeResearch: (playerResearch: PlayerResearch) => void;
/** The two completions, as Darwin's Voyage is built; one at once if its player is researching. */
export declare const darwinsVoyageCompleteRules: (
  playerResearchRegistry?: PlayerResearchRegistry,
  pendingEffects?: PendingEffectRegistry
) => BuildingComplete[];
/**
 * Each research a player starts while a completion is owed is completed at once. Registers the handler for the last
 *  one, so a game saved while one is owed can spend it after a load.
 */
export declare const darwinsVoyageStartedRules: (
  pendingEffects?: PendingEffectRegistry
) => Started[];
