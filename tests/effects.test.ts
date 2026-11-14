import {
  Colossus,
  CopernicusObservatory,
  CureForCancer,
  DarwinsVoyage,
  GreatLibrary,
  HangingGardens,
  JsBachsCathedral,
  KingRichardsCrusade,
  Lighthouse,
  MagellansExpedition,
  ShakespearesTheatre,
  StatueOfLiberty,
} from '../Wonders';
import {
  Anarchy,
  Communism,
  Democracy,
  Despotism,
  Fundamentalism,
  Monarchy,
  Republic,
} from '@civ-clone/civ2-government/Governments';
import {
  Electricity,
  Flight,
  Masonry,
  Railroad,
} from '@civ-clone/civ2-science/Advances';
import cityYieldModifier from '../Rules/City/yield-modifier';
import setUp from './lib/setUp';
import Barbarian from '@civ-clone/base-civilization-barbarian/Barbarian';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import CoastBound from '@civ-clone/base-unit-trait-coast-bound/CoastBound';
import Happiness from '@civ-clone/base-city-yield-happiness/Happiness';
import { Movement } from '@civ-clone/core-unit/Yields';
import Naval from '@civ-clone/base-unit-type-naval/Naval';
import { PendingEffectRegistry } from '@civ-clone/core-pending-effect';
import Production from '@civ-clone/base-terrain-yield-production/Production';
import Research from '@civ-clone/base-city-yield-research/Research';
import Rule from '@civ-clone/core-rule/Rule';
import Trade from '@civ-clone/base-terrain-yield-trade/Trade';
import Unhappiness from '@civ-clone/base-city-yield-unhappiness/Unhappiness';
import Unit from '@civ-clone/core-unit/Unit';
import Yield from '@civ-clone/core-yield/Yield';
import cityBuildingComplete from '../Rules/City/building-complete';
import cityCost from '../Rules/City/cost';
import cityYield from '../Rules/City/yield';
import { expect } from 'chai';
import governmentsAvailability from '../Rules/Governments/availability';
import playerAnarchyDuration from '../Rules/Player/anarchy-duration';
import playerResearchComplete from '../Rules/Player/research-complete';
import unitYield from '../Rules/Unit/yield';

/** What the rules that apply give, flattened. */
const applied = (rules: Rule<any, any>[], ...args: unknown[]): unknown[] =>
  rules
    .filter((rule) => rule.validate(...args))
    .flatMap((rule) => {
      const result = rule.process(...args);

      return result === undefined ? [] : [result];
    });

const total = (results: unknown[], YieldType: typeof Yield): number =>
  (results as Yield[])
    .filter((result) => result instanceof YieldType)
    .reduce((sum, result) => sum + result.value(), 0);

describe('city yields', (): void => {
  it('Colossus: 1 trade for each worked square with trade, in its city only, until Flight', (): void => {
    const {
        city,
        players,
        build,
        research,
        playerResearchRegistry,
        wonderRegistry,
        requirementRegistry,
      } = setUp(),
      squares = [[new Trade(2)], [new Production(1)], [new Trade(1)]],
      here = city(players[0], squares),
      other = city(players[0], squares),
      rules = cityYield(
        playerResearchRegistry,
        wonderRegistry,
        requirementRegistry
      );

    expect(total(applied(rules, here), Trade)).to.equal(0);

    build(new Colossus(here));

    expect(total(applied(rules, here), Trade)).to.equal(2);
    expect(total(applied(rules, other), Trade)).to.equal(0);

    research[3].addAdvance(Flight);

    expect(total(applied(rules, here), Trade)).to.equal(0);
  });

  it("King Richard's Crusade: 1 shield for each worked square, in its city only", (): void => {
    const {
        city,
        players,
        build,
        playerResearchRegistry,
        wonderRegistry,
        requirementRegistry,
      } = setUp(),
      squares = [[new Trade(2)], [new Production(1)], []],
      here = city(players[0], squares),
      rules = cityYield(
        playerResearchRegistry,
        wonderRegistry,
        requirementRegistry
      );

    build(new KingRichardsCrusade(here));

    expect(total(applied(rules, here), Production)).to.equal(3);
    expect(
      total(applied(rules, city(players[0], squares)), Production)
    ).to.equal(0);
  });

  it('Hanging Gardens: 1 happy in each of its owner’s cities, 3 in its own, until Railroad; Cure for Cancer 1', (): void => {
    const {
        city,
        players,
        build,
        research,
        playerResearchRegistry,
        wonderRegistry,
        requirementRegistry,
      } = setUp(),
      here = city(players[0]),
      other = city(players[0]),
      rival = city(players[1]),
      rules = cityYield(
        playerResearchRegistry,
        wonderRegistry,
        requirementRegistry
      );

    build(new HangingGardens(here));

    expect(total(applied(rules, here), Happiness)).to.equal(3);
    expect(total(applied(rules, other), Happiness)).to.equal(1);
    expect(total(applied(rules, rival), Happiness)).to.equal(0);

    build(new CureForCancer(city(players[1])));

    expect(total(applied(rules, rival), Happiness)).to.equal(1);
    expect(total(applied(rules, here), Happiness)).to.equal(3);

    research[2].addAdvance(Railroad);

    expect(total(applied(rules, here), Happiness)).to.equal(0);
    expect(total(applied(rules, rival), Happiness)).to.equal(1);
  });
});

describe('city costs', (): void => {
  const unhappy = (n: number): Yield[] => [new Unhappiness(n)];

  it("Shakespeare's Theatre: no one unhappy in its city", (): void => {
    const {
        city,
        players,
        build,
        playerResearchRegistry,
        wonderRegistry,
        requirementRegistry,
      } = setUp(),
      here = city(players[0]),
      rules = cityCost(
        playerResearchRegistry,
        wonderRegistry,
        requirementRegistry
      );

    build(new ShakespearesTheatre(here));

    expect(total(applied(rules, here, unhappy(5)), Unhappiness)).to.equal(-5);
    expect(total(applied(rules, here, unhappy(0)), Unhappiness)).to.equal(0);
    expect(
      total(applied(rules, city(players[0]), unhappy(5)), Unhappiness)
    ).to.equal(0);
  });

  it("J. S. Bach's Cathedral: 2 fewer unhappy in each of its owner's cities, never below none", (): void => {
    const {
        city,
        players,
        build,
        playerResearchRegistry,
        wonderRegistry,
        requirementRegistry,
      } = setUp(),
      rules = cityCost(
        playerResearchRegistry,
        wonderRegistry,
        requirementRegistry
      ),
      // Far from its own: Civ2 asks the owner, not the continent.
      elsewhere = city(players[0]);

    build(new JsBachsCathedral(city(players[0])));

    expect(total(applied(rules, elsewhere, unhappy(5)), Unhappiness)).to.equal(
      -2
    );
    expect(total(applied(rules, elsewhere, unhappy(1)), Unhappiness)).to.equal(
      -1
    );
    expect(total(applied(rules, elsewhere, unhappy(0)), Unhappiness)).to.equal(
      0
    );
    expect(
      total(applied(rules, city(players[1]), unhappy(5)), Unhappiness)
    ).to.equal(0);
  });
});

describe('science', (): void => {
  it('the Copernicus Observatory doubles its city’s science, after the rest', (): void => {
    const { city, players, build, registries } = setUp(),
      here = city(players[0]),
      rules = cityYieldModifier(registries),
      [copernicus] = rules,
      yields = [new Research(5), new Research(3)];

    build(new CopernicusObservatory(here));

    expect(copernicus.priority().value()).to.equal(4000);
    expect(total(applied(rules, here, yields, yields), Research)).to.equal(8);
    expect(
      total(applied(rules, city(players[0]), yields, yields), Research)
    ).to.equal(0);
  });
});

describe('ships', (): void => {
  class Galleon extends Naval {}
  class Trireme extends Naval {}
  class Musketman extends Unit {}

  const unit = (UnitType: typeof Unit, player: unknown) =>
    Object.assign(Object.create(UnitType.prototype), {
      player: () => player,
      hasTrait: (Trait: unknown): boolean =>
        UnitType === Trireme && Trait === CoastBound,
    }) as Unit;

  const moves = (rules: Rule<any, any>[], target: Unit): number => {
    const movement = new Movement(1);

    applied(rules, target, movement);

    return movement.value();
  };

  it("the Lighthouse: 1 more move for a ship that isn't coast-bound; Magellan's: 2 more for any", (): void => {
    const {
        players,
        city,
        build,
        playerResearchRegistry,
        wonderRegistry,
        requirementRegistry,
      } = setUp(),
      rules = unitYield(
        wonderRegistry,
        playerResearchRegistry,
        requirementRegistry
      );

    build(new Lighthouse(city(players[0])));

    expect(moves(rules, unit(Galleon, players[0]))).to.equal(2);
    expect(moves(rules, unit(Trireme, players[0]))).to.equal(1);
    expect(moves(rules, unit(Musketman, players[0]))).to.equal(1);
    expect(moves(rules, unit(Galleon, players[1]))).to.equal(1);

    build(new MagellansExpedition(city(players[0])));

    expect(moves(rules, unit(Galleon, players[0]))).to.equal(4);
    expect(moves(rules, unit(Trireme, players[0]))).to.equal(3);
  });
});

describe('the Statue of Liberty', (): void => {
  it('opens every government but Anarchy to its owner, and ends Anarchy next turn', (): void => {
    const {
        players,
        city,
        build,
        playerResearchRegistry,
        wonderRegistry,
        requirementRegistry,
      } = setUp(),
      [availability] = governmentsAvailability(
        playerResearchRegistry,
        wonderRegistry,
        requirementRegistry
      ),
      [anarchy] = playerAnarchyDuration(
        playerResearchRegistry,
        wonderRegistry,
        requirementRegistry
      );

    expect(availability.validate(Democracy, players[0])).false;
    expect(anarchy.validate(players[0], 'chosen')).false;

    build(new StatueOfLiberty(city(players[0])));

    [Monarchy, Communism, Fundamentalism, Republic, Democracy].forEach(
      (Government) => expect(availability.validate(Government, players[0])).true
    );
    expect(availability.validate(Anarchy, players[0])).false;
    // Despotism is civ2-government's, always.
    expect(availability.validate(Despotism, players[0])).false;
    expect(availability.validate(Democracy, players[1])).false;
    expect(anarchy.validate(players[0], 'chosen')).true;
    expect(anarchy.validate(players[0], 'civil-disorder')).true;
    expect(anarchy.process(players[0], 'chosen')).to.equal(1);
    expect(anarchy.validate(players[1], 'chosen')).false;
  });
});

describe('the Great Library', (): void => {
  it('gives its owner an advance 2 civilizations have, not counting barbarians, until Electricity', (): void => {
    const {
        players,
        research,
        city,
        build,
        playerResearchRegistry,
        wonderRegistry,
        requirementRegistry,
      } = setUp(),
      [rule] = playerResearchComplete(
        playerResearchRegistry,
        wonderRegistry,
        requirementRegistry
      ),
      masonry = new Masonry();

    // Player 3 plays the barbarians.
    (players[3] as any).civilization = () => new Barbarian();

    build(new GreatLibrary(city(players[0])));

    research[1].addAdvance(Masonry);
    research[3].addAdvance(Masonry);

    expect(rule.validate(research[1], masonry)).false;

    research[2].addAdvance(Masonry);

    expect(rule.validate(research[2], masonry)).true;

    rule.process(research[2], masonry);

    expect(research[0].completed(Masonry)).true;

    research[1].addAdvance(Electricity);

    expect(rule.validate(research[2], masonry)).false;
  });
});

describe("Darwin's Voyage", (): void => {
  it('owes its player two research completions', (): void => {
    const { players, research, city, playerResearchRegistry, wonderRegistry } =
        setUp(),
      pendingEffects = new PendingEffectRegistry(),
      rules = cityBuildingComplete(
        undefined,
        playerResearchRegistry,
        wonderRegistry,
        undefined,
        pendingEffects
      ),
      here = city(players[0]),
      cityBuild = { city: () => here } as unknown as CityBuild;

    applied(rules, cityBuild, new DarwinsVoyage(here));

    const [owed] = pendingEffects.getByTarget(research[0]);

    expect(owed.handler()).to.equal('civ2-wonder:darwins-voyage');
    expect(owed.data()).to.deep.equal({ remaining: '2' });
    expect(wonderRegistry.entries().length).to.equal(1);
  });
});
