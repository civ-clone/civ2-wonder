import AdvanceRegistry from '@civ-clone/core-science/AdvanceRegistry';
import City from '@civ-clone/core-city/City';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import CityImprovementRegistry from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import Player from '@civ-clone/core-player/Player';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import PlayerResearchRegistry from '@civ-clone/core-science/PlayerResearchRegistry';
import RequirementRegistry from '@civ-clone/core-requirement/RequirementRegistry';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Wonder from '@civ-clone/core-wonder/Wonder';
import WonderRegistry from '@civ-clone/core-wonder/WonderRegistry';
import Yield from '@civ-clone/core-yield/Yield';
import { obsoletedBy } from '../../Requirements';

export type TestCity = City & { destroy(): void };

/** Registries of their own, the obsolete entries in `requirements`, four players and stand-in cities. */
export const setUp = () => {
  const ruleRegistry = new RuleRegistry(),
    advanceRegistry = new AdvanceRegistry(),
    wonderRegistry = new WonderRegistry(),
    cityImprovementRegistry = new CityImprovementRegistry(),
    playerResearchRegistry = new PlayerResearchRegistry(),
    requirementRegistry = new RequirementRegistry(ruleRegistry),
    players = [0, 1, 2, 3].map(() => new Player(ruleRegistry)),
    research = players.map(
      (player: Player): PlayerResearch =>
        new PlayerResearch(player, advanceRegistry, ruleRegistry)
    ),
    // A `City` the registries accept, answering only what the rules ask. Its worked squares yield `tileYields`.
    city = (player: Player, tileYields: Yield[][] = []): TestCity => {
      let destroyed = false;

      return Object.assign(Object.create(City.prototype), {
        destroyed: (): boolean => destroyed,
        destroy: (): void => {
          destroyed = true;
        },
        player: (): Player => player,
        tile: () => ({}),
        tilesWorked: () =>
          tileYields.map((yields: Yield[]) => ({ yields: () => yields })),
      }) as TestCity;
    },
    build = <T extends CityImprovement>(improvement: T): T => {
      cityImprovementRegistry.register(improvement);

      if (improvement instanceof Wonder) {
        wonderRegistry.register(improvement);
      }

      return improvement;
    };

  playerResearchRegistry.register(...research);
  requirementRegistry.add(null, ...obsoletedBy);

  return {
    ruleRegistry,
    wonderRegistry,
    cityImprovementRegistry,
    playerResearchRegistry,
    requirementRegistry,
    players,
    research,
    city,
    build,
    registries: {
      cityImprovementRegistry,
      playerResearchRegistry,
      requirementRegistry,
      wonderRegistry,
    },
  };
};

export default setUp;
