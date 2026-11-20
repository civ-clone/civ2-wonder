import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import { RequirementRegistry } from '@civ-clone/core-requirement/RequirementRegistry';
import { WonderRegistry } from '@civ-clone/core-wonder/WonderRegistry';
import CityTileYield from '@civ-clone/core-city/Rules/CityTileYield';
export interface CityTileYieldRegistries {
  playerResearchRegistry?: PlayerResearchRegistry;
  requirementRegistry?: RequirementRegistry;
  wonderRegistry?: WonderRegistry;
}
export declare const colossusTrade: number, kingRichardsProduction: number;
export declare const getRules: ({
  playerResearchRegistry,
  requirementRegistry,
  wonderRegistry,
}?: CityTileYieldRegistries) => CityTileYield[];
export default getRules;
