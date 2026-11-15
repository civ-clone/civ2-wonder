import { Colossus, KingRichardsCrusade } from '../Wonders';
import CityTileYield from '@civ-clone/core-city/Rules/CityTileYield';
import { Flight } from '@civ-clone/civ2-science/Advances';
import Production from '@civ-clone/base-terrain-yield-production/Production';
import Tile from '@civ-clone/core-world/Tile';
import Trade from '@civ-clone/base-terrain-yield-trade/Trade';
import Yield from '@civ-clone/core-yield/Yield';
import cityTileYield from '../Rules/City/tile-yield';
import { expect } from 'chai';
import setUp from './lib/setUp';
import { tileYieldSteps } from '@civ-clone/civ2-city/lib/tileYieldPipeline';

// OpenCiv2 `city_tile_yield` (`src/auto/city.cpp`, richardpenman/civ2@49f26ec): the Colossus at lines 2841 (ocean) and
//  2890 (land with trade), King Richard's Crusade at 2894 (every square), each at its step of civ2-city's pipeline.
describe('the Colossus and King Richard’s Crusade on each square', (): void => {
  const square = (water: boolean): Tile =>
      ({ isWater: () => water, isLand: () => !water } as unknown as Tile),
    ocean = square(true),
    land = square(false),
    after = (
      rules: CityTileYield[],
      city: unknown,
      tile: Tile,
      ...start: Yield[]
    ): Yield[] => {
      const yields = [...start];

      rules.forEach((rule) => {
        if (rule.validate(city, tile, yields)) {
          rule.process(city, tile, yields);
        }
      });

      return yields;
    },
    total = (yields: Yield[], YieldType: typeof Yield): number =>
      yields
        .filter((tileYield) => tileYield instanceof YieldType)
        .reduce((sum, tileYield) => sum + tileYield.value(), 0);

  it('runs at civ2-city’s steps for them', (): void => {
    const [colossusOcean, colossusLand, kingRichards] = cityTileYield();

    expect(colossusOcean.priority().value()).to.equal(
      tileYieldSteps.colossusOcean
    );
    expect(colossusLand.priority().value()).to.equal(
      tileYieldSteps.colossusLand
    );
    expect(kingRichards.priority().value()).to.equal(
      tileYieldSteps.kingRichards
    );
  });

  it('the Colossus: +1 trade on every ocean square, even one with none, and on land with trade, until Flight', (): void => {
    const { city, players, build, research, registries } = setUp(),
      rules = cityTileYield(registries),
      here = city(players[0]),
      other = city(players[0]);

    expect(total(after(rules, here, ocean, new Trade(2)), Trade)).to.equal(2);

    build(new Colossus(here));

    expect(total(after(rules, here, ocean, new Trade(2)), Trade)).to.equal(3);
    expect(total(after(rules, here, ocean), Trade)).to.equal(1);
    expect(total(after(rules, here, land, new Trade(1)), Trade)).to.equal(2);
    expect(
      total(after(rules, here, land, new Trade(0), new Production(1)), Trade)
    ).to.equal(0);
    expect(total(after(rules, other, ocean, new Trade(2)), Trade)).to.equal(2);

    research[3].addAdvance(Flight);

    expect(total(after(rules, here, ocean, new Trade(2)), Trade)).to.equal(2);
  });

  it("King Richard's Crusade: +1 shield on every square, ocean included, in its city only", (): void => {
    const { city, players, build, registries } = setUp(),
      rules = cityTileYield(registries),
      here = city(players[0]),
      other = city(players[0]);

    build(new KingRichardsCrusade(here));

    expect(total(after(rules, here, land), Production)).to.equal(1);
    expect(
      total(after(rules, here, ocean, new Production(2)), Production)
    ).to.equal(3);
    expect(
      total(after(rules, other, land, new Production(2)), Production)
    ).to.equal(2);
  });
});
