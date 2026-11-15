import {
  ApolloProgram,
  CopernicusObservatory,
  CureForCancer,
  DarwinsVoyage,
  GreatLibrary,
  HangingGardens,
  JsBachsCathedral,
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
import City from '@civ-clone/core-city/City';
import { Engine } from '@civ-clone/core-engine/Engine';
import FillGenerator from '@civ-clone/simple-world-generator/tests/lib/FillGenerator';
import { Game } from '@civ-clone/core-game';
import { Grassland } from '@civ-clone/civ2-world/Terrains';
import Player from '@civ-clone/core-player/Player';
import PlayerWorld from '@civ-clone/core-player-world/PlayerWorld';
import World from '@civ-clone/core-world/World';
import Cost from '@civ-clone/core-science/Rules/Cost';
import Effect from '@civ-clone/core-rule/Effect';
import { darwinsVoyageStartedRules } from '../lib/darwinsVoyage';
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
      rules = cityYield({
        playerResearchRegistry,
        wonderRegistry,
        requirementRegistry,
      });

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
      // After Leonardo's Workshop's rule, as `civ_give_advance` calls `civ_leonardo_upgrade` first.
      [, rule] = playerResearchComplete(
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

describe('the Great Library, for any advance gained', (): void => {
  it('also fires for an advance given rather than researched (a hut, a treaty, Philosophy), as `addAdvance` processes `Complete`', (): void => {
    const {
      ruleRegistry,
      players,
      research,
      city,
      build,
      playerResearchRegistry,
      wonderRegistry,
      requirementRegistry,
    } = setUp();

    ruleRegistry.register(
      ...playerResearchComplete(
        playerResearchRegistry,
        wonderRegistry,
        requirementRegistry
      )
    );
    build(new GreatLibrary(city(players[0])));

    research[1].addAdvance(Masonry);

    expect(research[0].completed(Masonry)).false;

    research[2].addAdvance(Masonry);

    expect(research[0].completed(Masonry)).true;
  });
});

describe("Darwin's Voyage", (): void => {
  // `city_process_production_complete_improvement` calls `civ_research_complete` twice; each gives the research and
  //  sets `research_progress` to 0.
  const darwin = () => {
    const {
        players,
        research,
        city,
        playerResearchRegistry,
        ruleRegistry,
        wonderRegistry,
      } = setUp(),
      pendingEffects = new PendingEffectRegistry(),
      rules = cityBuildingComplete({
        playerResearchRegistry,
        wonderRegistry,
        pendingEffects,
      }),
      started = darwinsVoyageStartedRules(pendingEffects),
      here = city(players[0]),
      cityBuild = { city: () => here } as unknown as CityBuild;

    // Every advance costs 10 here.
    ruleRegistry.register(new Cost(new Effect((): number => 10)), ...started);
    research[0].research(Masonry);

    return {
      research: research[0],
      pendingEffects,
      complete: () => applied(rules, cityBuild, new DarwinsVoyage(here)),
    };
  };

  it('completes the research under way at once, losing the progress towards it, and owes one more', (): void => {
    const { research, pendingEffects, complete } = darwin();

    research.progress().set(5);
    complete();

    expect(research.completed(Masonry)).true;
    expect(research.progress().value()).to.equal(0);

    const [owed] = pendingEffects.getByTarget(research);

    expect(owed.handler()).to.equal('civ2-wonder:darwins-voyage');
    expect(owed.data()).to.deep.equal({ remaining: '1' });
  });

  it('completes the next research chosen at once, and owes nothing after', (): void => {
    const { research, pendingEffects, complete } = darwin();

    complete();
    research.progress().set(3);
    research.research(Railroad);

    expect(research.completed(Railroad)).true;
    expect(research.progress().value()).to.equal(0);
    expect(pendingEffects.getByTarget(research)).to.deep.equal([]);
  });
});

describe('the Apollo Program', (): void => {
  it('shows every player every square, once built', async (): Promise<void> => {
    const game = new Game(),
      world = new World(new FillGenerator(4, 3, Grassland), game.rules),
      engine = new Engine(),
      events: unknown[][] = [];

    await world.build();

    const players = [0, 1, 2].map(() => new Player(game.rules)),
      playerWorlds = players.map(
        (player) => new PlayerWorld(player, world, game.rules)
      ),
      tile = world.get(1, 1),
      here = Object.assign(Object.create(City.prototype), {
        player: () => players[0],
        tile: () => tile,
      }) as City,
      rules = cityBuildingComplete({
        engine,
        playerWorldRegistry: game.playerWorlds,
        wonderRegistry: game.wonders,
        playerResearchRegistry: game.playerResearch,
      }),
      cityBuild = { city: () => here } as unknown as CityBuild,
      apollo = new ApolloProgram(here);

    game.playerWorlds.register(...playerWorlds);
    playerWorlds[0].register(tile);
    engine.on('wonder:apollo-revealed', (...args: unknown[]) =>
      events.push(args)
    );

    applied(rules, cityBuild, apollo);

    playerWorlds.forEach((playerWorld) =>
      expect(playerWorld.tiles().length).to.equal(12)
    );
    expect(events).to.deep.equal([[apollo, here]]);
  });
});
