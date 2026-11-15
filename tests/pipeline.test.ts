import { Colossus, KingRichardsCrusade } from '../Wonders';
import { Despotism, Monarchy } from '@civ-clone/civ2-government/Governments';
import { Grassland, Hills, Ocean } from '@civ-clone/civ2-world/Terrains';
import FillGenerator from '@civ-clone/simple-world-generator/tests/lib/FillGenerator';
import World from '@civ-clone/core-world/World';
import { Mine, Railroad, Road } from '@civ-clone/civ2-world/TileImprovements';
import City from '@civ-clone/core-city/City';
import Government from '@civ-clone/core-government/Government';
import { LEADER_CELEBRATION } from '@civ-clone/civ2-city/lib/celebrating';
import LandMassRegistry from '@civ-clone/core-world/LandMassRegistry';
import Player from '@civ-clone/core-player/Player';
import Production from '@civ-clone/base-terrain-yield-production/Production';
import RequirementRegistry from '@civ-clone/core-requirement/RequirementRegistry';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Terrain from '@civ-clone/core-terrain/Terrain';
import TerrainFeatureRegistry from '@civ-clone/core-terrain-feature/TerrainFeatureRegistry';
import Tile from '@civ-clone/core-world/Tile';
import TileImprovement from '@civ-clone/core-tile-improvement/TileImprovement';
import TileImprovementRegistry from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import Trade from '@civ-clone/base-terrain-yield-trade/Trade';
import Wonder from '@civ-clone/core-wonder/Wonder';
import WonderRegistry from '@civ-clone/core-wonder/WonderRegistry';
import PlayerResearchRegistry from '@civ-clone/core-science/PlayerResearchRegistry';
import Yield from '@civ-clone/core-yield/Yield';
import cityTileYield from '@civ-clone/civ2-city/Rules/City/tile-yield';
import { expect } from 'chai';
import { obsoletedBy } from '../Requirements';
import tileYield from '../Rules/City/tile-yield';
import worldTileYield from '@civ-clone/civ2-world/Rules/Tile/yield';
import worldYieldModifier from '@civ-clone/civ2-world/Rules/Tile/yield-modifier';

// Worked examples through the real per-square pipeline: civ2-world's square rules, civ2-city's steps
//  (`Rules/City/tile-yield`) and this package's, as `City#tileYields` runs them. Each number is OpenCiv2's
//  `city_tile_yield` (`src/auto/city.cpp`, richardpenman/civ2@49f26ec), worked by hand.
describe('the Colossus and King Richard’s Crusade through the whole pipeline', (): void => {
  const setUp = async (
    government: typeof Government,
    celebrating: boolean,
    ...wonders: (typeof Wonder)[]
  ) => {
    const ruleRegistry = new RuleRegistry(),
      tileImprovementRegistry = new TileImprovementRegistry(),
      terrainFeatureRegistry = new TerrainFeatureRegistry(),
      wonderRegistry = new WonderRegistry(),
      playerResearchRegistry = new PlayerResearchRegistry(),
      requirementRegistry = new RequirementRegistry(ruleRegistry),
      playerGovernmentRegistry = {
        getByPlayer: () => ({
          is: (...Types: (typeof Government)[]) =>
            Types.some((Type) => Type === government),
          get: () => new government(),
        }),
      } as any,
      cityResearch = {
        getByPlayer: () => ({ completed: () => false }),
      } as any,
      pendingEffects = {
        getByTarget: () =>
          celebrating ? [{ handler: () => LEADER_CELEBRATION }] : [],
      } as any,
      world = new World(
        new FillGenerator(5, 5, Grassland),
        ruleRegistry,
        new LandMassRegistry()
      ),
      player = new Player(ruleRegistry),
      city =
        (await world.build(),
        new City(player, world.get(2, 2), 'Test', ruleRegistry));

    requirementRegistry.add(null, ...obsoletedBy);
    ruleRegistry.register(
      ...worldTileYield(tileImprovementRegistry, terrainFeatureRegistry),
      ...worldYieldModifier(tileImprovementRegistry, playerGovernmentRegistry),
      ...cityTileYield(
        tileImprovementRegistry,
        playerGovernmentRegistry,
        cityResearch,
        pendingEffects
      ),
      ...tileYield({
        playerResearchRegistry,
        requirementRegistry,
        wonderRegistry,
      })
    );
    wonders.forEach((WonderType) =>
      wonderRegistry.register(new WonderType(city))
    );

    const square = (
        TerrainType: typeof Terrain,
        ...Improvements: (typeof TileImprovement)[]
      ): Tile => {
        const tile = world.get(1, 1);

        tile.setTerrain(new TerrainType());
        Improvements.forEach((Improvement) =>
          tileImprovementRegistry.register(new Improvement(tile))
        );
        tile.clearYieldCache(player);

        return tile;
      },
      total = (tile: Tile, YieldType: typeof Yield): number =>
        city
          .tileYields(tile)
          .filter((tileYield) => tileYield instanceof YieldType)
          .reduce((sum, tileYield) => sum + tileYield.value(), 0);

    return { square, total };
  };

  // An ocean square: 2 trade (@TERRAIN row 10). Line 2841 adds the Colossus' 1 (3); under Despotism 2909–2917 take 1
  //  from a value over 2 unless the city celebrates; from Monarchy up a celebrating city gets 2918–2925's +1.
  (
    [
      ['Despotism', Despotism, false, [], 2],
      ['Despotism', Despotism, false, [Colossus], 2],
      ['Despotism, celebrating', Despotism, true, [Colossus], 3],
      ['Monarchy', Monarchy, false, [Colossus], 3],
      ['Monarchy, celebrating', Monarchy, true, [Colossus], 4],
      ['Monarchy, celebrating', Monarchy, true, [], 3],
    ] as [string, typeof Government, boolean, (typeof Wonder)[], number][]
  ).forEach(([label, government, celebrating, wonders, expected]) =>
    it(`an ocean square's trade, ${label}, ${
      wonders.length ? 'with' : 'without'
    } the Colossus: ${expected}`, async (): Promise<void> => {
      const { square, total } = await setUp(
        government,
        celebrating,
        ...wonders
      );

      expect(total(square(Ocean), Trade)).to.equal(expected);
    })
  );

  // Hills with a mine: 0 + 3 shields (@TERRAIN row 4). Line 2894 adds King Richard's 1 (4); the railroad (2897–2907)
  //  adds half, rounded down (6); Despotism takes 1 from a value over 2 (5). Without the Wonder: 3, 4, then 3.
  (
    [
      ['Monarchy', Monarchy, [KingRichardsCrusade], 6],
      ['Monarchy', Monarchy, [], 4],
      ['Despotism', Despotism, [KingRichardsCrusade], 5],
      ['Despotism', Despotism, [], 3],
    ] as [string, typeof Government, (typeof Wonder)[], number][]
  ).forEach(([label, government, wonders, expected]) =>
    it(`a mined railroad Hills square's shields, ${label}, ${
      wonders.length ? 'with' : 'without'
    } King Richard's: ${expected}`, async (): Promise<void> => {
      const { square, total } = await setUp(government, false, ...wonders);

      expect(total(square(Hills, Mine, Road, Railroad), Production)).to.equal(
        expected
      );
    })
  );
});
