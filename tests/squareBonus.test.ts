import { Despotism, Monarchy } from '@civ-clone/civ2-government/Governments';
import { Forest, Ocean } from '@civ-clone/civ2-world/Terrains';
import { KingRichardsCrusade, Colossus } from '../Wonders';
import City from '@civ-clone/core-city/City';
import { Game } from '@civ-clone/core-game';
import Player from '@civ-clone/core-player/Player';
import PlayerGovernment from '@civ-clone/core-government/PlayerGovernment';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import Production from '@civ-clone/base-terrain-yield-production/Production';
import Terrain from '@civ-clone/core-terrain/Terrain';
import Tile from '@civ-clone/core-world/Tile';
import Trade from '@civ-clone/base-terrain-yield-trade/Trade';
import World from '@civ-clone/core-world/World';
import Yield from '@civ-clone/core-yield/Yield';
import { Pollution, Railroad } from '@civ-clone/civ2-world/TileImprovements';
import TileImprovementRegistry from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import cityYield from '../Rules/City/yield';
import { throughLaterSteps } from '../lib/squareBonus';
import { expect } from 'chai';
import { register as registerWorld } from '@civ-clone/civ2-world/registerRules';

// On real squares, with civ2-world's square rules in a game of their own: the Colossus' and King Richard's +1 come
//  before the penalty below Monarchy, as OpenCiv2's `city_tile_yield` adds them (richardpenman/civ2@49f26ec).
describe('a Wonder’s +1 on a square, through the government’s steps', (): void => {
  const game = new Game(),
    player = new Player(game.rules),
    playerGovernment = new PlayerGovernment(
      player,
      game.availableGovernments,
      game.rules
    ),
    square = (TerrainType: new () => Terrain): Tile =>
      new Tile(0, 0, new TerrainType(), {} as World, game.rules),
    city = (...tiles: Tile[]): City =>
      Object.assign(Object.create(City.prototype), {
        destroyed: () => false,
        player: () => player,
        tilesWorked: () => ({ entries: () => tiles }),
      }) as City,
    rules = cityYield({
      pendingEffects: game.pendingEffects,
      playerGovernmentRegistry: game.playerGovernments,
      playerResearchRegistry: game.playerResearch,
      requirementRegistry: game.requirements,
      tileImprovementRegistry: game.tileImprovements,
      wonderRegistry: game.wonders,
    }),
    of = (target: City, YieldType: typeof Yield): number =>
      rules
        .filter((rule) => rule.validate(target))
        .map((rule) => rule.process(target) as Yield)
        .filter((result) => result instanceof YieldType)
        .reduce((total, result) => total + result.value(), 0),
    total = (tile: Tile, YieldType: typeof Yield): number =>
      tile
        .yields(player)
        .filter((tileYield) => tileYield instanceof YieldType)
        .reduce((sum, tileYield) => sum + tileYield.value(), 0),
    govern = (GovernmentType: typeof Despotism, ...tiles: Tile[]): void => {
      playerGovernment.set(new GovernmentType());
      tiles.forEach((tile) => tile.clearYieldCache(player));
    };

  registerWorld(game);
  game.players.register(player);
  game.playerGovernments.register(playerGovernment);
  game.playerResearch.register(
    new PlayerResearch(player, game.advances, game.rules)
  );

  it('the Colossus: a 2-trade ocean square stays at 2 under Despotism, and makes 3 under Monarchy', (): void => {
    const ocean = square(Ocean),
      here = city(ocean);

    game.wonders.register(new Colossus(here));

    govern(Despotism, ocean);
    expect(total(ocean, Trade)).to.equal(2);
    expect(of(here, Trade)).to.equal(0);

    govern(Monarchy, ocean);
    expect(total(ocean, Trade)).to.equal(2);
    expect(of(here, Trade)).to.equal(1);
  });

  it("King Richard's: a 2-shield forest stays at 2 under Despotism, and makes 3 under Monarchy", (): void => {
    const forest = square(Forest),
      here = city(forest);

    game.wonders.register(new KingRichardsCrusade(here));

    govern(Despotism, forest);
    expect(total(forest, Production)).to.equal(2);
    expect(of(here, Production)).to.equal(0);

    govern(Monarchy, forest);
    expect(of(here, Production)).to.equal(1);
  });
});

describe('throughLaterSteps', (): void => {
  const tile = {} as Tile,
    on = (...improvements: object[]) =>
      ({ getByTile: () => improvements } as unknown as TileImprovementRegistry);

  it('adds a railroad’s half again to shields only, then halves for pollution, rounding up', (): void => {
    const railroad = Object.create(Railroad.prototype),
      pollution = Object.create(Pollution.prototype);

    expect(throughLaterSteps(tile, Production, 3, null, false, on())).to.equal(
      3
    );
    expect(
      throughLaterSteps(tile, Production, 3, null, false, on(railroad))
    ).to.equal(4);
    expect(
      throughLaterSteps(tile, Trade, 3, null, false, on(railroad))
    ).to.equal(3);
    expect(
      throughLaterSteps(tile, Trade, 3, null, false, on(pollution))
    ).to.equal(2);
    expect(
      throughLaterSteps(
        tile,
        Production,
        3,
        null,
        false,
        on(railroad, pollution)
      )
    ).to.equal(2);
  });
});
