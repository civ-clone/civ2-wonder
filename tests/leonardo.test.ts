import {
  Automobile,
  Conscription,
  Feudalism,
  Gunpowder,
  Monotheism,
  Polytheism,
} from '@civ-clone/civ2-science/Advances';
import {
  Chariot,
  Crusader,
  Elephant,
  Musketman,
  Spearman,
  Pikeman,
  Rifleman,
  Warrior,
} from '@civ-clone/civ2-unit/Units';
import { STEAL_ADVANCE_RULE } from '../Rules/City/captured';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import BuildingComplete from '@civ-clone/core-city-build/Rules/BulidingComplete';
import Captured from '@civ-clone/core-city/Rules/Captured';
import City from '@civ-clone/core-city/City';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import { Engine } from '@civ-clone/core-engine/Engine';
import FillGenerator from '@civ-clone/simple-world-generator/tests/lib/FillGenerator';
import { Game } from '@civ-clone/core-game';
import { Grassland } from '@civ-clone/civ2-world/Terrains';
import { LeonardosWorkshop } from '../Wonders';
import Player from '@civ-clone/core-player/Player';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import Unit from '@civ-clone/core-unit/Unit';
import Veteran from '@civ-clone/base-unit-improvement-veteran/UnitImprovements/Veteran';
import World from '@civ-clone/core-world/World';
import { expect } from 'chai';
import register from '../registerRules';
import roles from '@civ-clone/civ2-unit/Rules/Unit/roles';

// OpenCiv2 `civ_leonardo_upgrade` (`src/auto/civ.cpp`, richardpenman/civ2@49f26ec) and its three callers:
//  `civ_give_advance` (each advance its owner is given), `city_process_production_complete_improvement` (the Wonder
//  completed) and `city_capture` (its city taken, for the captor). Every eligible unit at once, one step each, losing
//  veteran status; nothing once the Wonder has expired (Automobile, known to anyone).
describe("Leonardo's Workshop", (): void => {
  const setUp = async () => {
    const engine = new Engine(),
      game = new Game({ engine }),
      world = new World(new FillGenerator(5, 5, Grassland), game.rules);

    await world.build();

    register(game);
    // civ2-unit's roles, which the upgrade table and the rules read.
    game.rules.register(...roles());

    const players = [0, 1, 2].map((): Player => {
        const player = new Player(game.rules);

        game.playerResearch.register(
          new PlayerResearch(player, game.advances, game.rules)
        );

        return player;
      }),
      research = (player: Player): PlayerResearch =>
        game.playerResearch.getByPlayer(player),
      events: [Unit, typeof Unit, typeof Unit][] = [],
      owner = { current: players[0] },
      city = Object.assign(Object.create(City.prototype), {
        destroyed: () => false,
        player: () => owner.current,
        tile: () => world.get(2, 2),
      }) as City,
      unit = (
        UnitType: typeof Unit,
        player: Player,
        veteran: boolean = false
      ): Unit => {
        const created = new UnitType(null, player, world.get(1, 1), game.rules);

        game.units.register(created);

        if (veteran) {
          game.unitImprovements.register(new Veteran(created));
        }

        return created;
      },
      isVeteran = (unit: Unit): boolean =>
        game.unitImprovements
          .getByUnit(unit)
          .some((improvement) => improvement instanceof Veteran),
      complete = (): LeonardosWorkshop => {
        const wonder = new LeonardosWorkshop(city);

        game.rules.process(
          BuildingComplete,
          { city: () => city } as unknown as CityBuild,
          wonder
        );

        return wonder;
      },
      capture = (captor: Player): void => {
        const previous = owner.current;

        owner.current = captor;
        game.rules.process(Captured, city, captor, previous, null);
      };

    engine.on('unit:upgraded', (...args: unknown[]) =>
      events.push(args as [Unit, typeof Unit, typeof Unit])
    );

    return {
      game,
      players,
      research,
      unit,
      isVeteran,
      complete,
      capture,
      events,
    };
  };

  it('upgrades every eligible unit of its owner when completed, taking away veteran status', async (): Promise<void> => {
    const { players, research, unit, isVeteran, complete, events } =
        await setUp(),
      spearman = unit(Spearman, players[0], true),
      warrior = unit(Warrior, players[0]),
      musketeers = unit(Musketman, players[0], true),
      rivals = unit(Spearman, players[1]);

    research(players[0]).addAdvance(Feudalism);
    research(players[1]).addAdvance(Feudalism);

    expect(spearman instanceof Pikeman).false;

    complete();

    expect(spearman instanceof Pikeman).true;
    expect(warrior instanceof Pikeman).true;
    expect(isVeteran(spearman)).false;
    // No upgrade for Musketeers yet, so they keep their status.
    expect(musketeers instanceof Musketman).true;
    expect(isVeteran(musketeers)).true;
    expect(rivals instanceof Spearman).true;
    expect(
      events.map(([upgraded, from, to]) => [
        upgraded === spearman || upgraded === warrior,
        from,
        to,
      ])
    ).to.deep.equal([
      [true, Spearman, Pikeman],
      [true, Warrior, Pikeman],
    ]);
  });

  it('upgrades its owner’s units on each advance they are given, and no one else’s', async (): Promise<void> => {
    const { players, research, unit, complete } = await setUp(),
      musketeers = unit(Musketman, players[0]),
      rivals = unit(Musketman, players[1]);

    complete();
    research(players[1]).addAdvance(Conscription);

    expect(rivals instanceof Musketman).true;
    expect(musketeers instanceof Musketman).true;

    research(players[0]).addAdvance(Conscription);

    expect(musketeers instanceof Rifleman).true;
  });

  it('takes defensive units weaker than Musketeers straight to Musketeers with Gunpowder', async (): Promise<void> => {
    const { players, research, unit, complete } = await setUp(),
      warrior = unit(Warrior, players[0]);

    complete();
    research(players[0]).addAdvance(Gunpowder);

    expect(warrior instanceof Musketman).true;
  });

  it('does nothing once expired: not for the advance that expires it, nor when a rival knows Automobile', async (): Promise<void> => {
    const { players, research, unit, complete } = await setUp(),
      spearman = unit(Spearman, players[0]);

    complete();
    research(players[0]).addAdvance(Automobile);
    research(players[0]).addAdvance(Feudalism);

    expect(spearman instanceof Spearman).true;

    const other = await setUp(),
      theirs = other.unit(Spearman, other.players[0]);

    other.research(other.players[0]).addAdvance(Feudalism);
    other.research(other.players[1]).addAdvance(Automobile);
    other.complete();

    expect(theirs instanceof Spearman).true;
  });

  it('upgrades the captor’s units when its city is taken, and not the loser’s', async (): Promise<void> => {
    const { players, research, unit, complete, capture } = await setUp(),
      losers = unit(Spearman, players[0]),
      captors = unit(Spearman, players[1]);

    complete();
    research(players[1]).addAdvance(Feudalism);
    // The captor has no Leonardo's Workshop yet: their advance upgraded nothing.
    expect(captors instanceof Spearman).true;

    capture(players[1]);

    expect(captors instanceof Pikeman).true;
    expect(losers instanceof Spearman).true;
  });

  // `city_capture_aftermath`: the steal's `civ_give_advance` pass (city.cpp 5525), then the capture pass (5542). A
  //  captor who knows Monotheism and takes Polytheism: Chariots become Elephants, then Crusaders.
  it('runs the capture pass after the advance taken from the city, so a unit can go two steps', async (): Promise<void> => {
    const { game, players, research, unit, complete, capture } = await setUp(),
      chariot = unit(Chariot, players[1]);

    let taken: Promise<void> = Promise.resolve();

    // A stand-in for civ2-science's steal: the captor's client chooses later, as `takeAdvance` awaits it.
    game.rules.register(
      new Captured(
        STEAL_ADVANCE_RULE,
        new Criterion(
          (city: City, captor: Player): boolean =>
            !research(captor).completed(Polytheism)
        ),
        new Effect((city: City, captor: Player): void => {
          taken = Promise.resolve().then(() =>
            research(captor).addAdvance(Polytheism)
          );
        })
      )
    );

    complete();
    research(players[1]).addAdvance(Monotheism);
    capture(players[1]);

    // Nothing yet: the capture pass waits for the stolen advance.
    expect(chariot instanceof Chariot).true;

    await taken;

    expect(chariot instanceof Crusader).true;
    expect(chariot instanceof Elephant).false;
  });
});
