import * as Wonders from '../Wonders';
import { obsoletedBy, requiresAdvance } from '../Requirements';
import { wonderRows, wonderTypes } from '../lib/wonderTable';
import BuildCost from '@civ-clone/core-city-build/Rules/BuildCost';
import BuildItem from '@civ-clone/core-city-build/BuildItem';
import Buildable from '@civ-clone/core-city-build/Buildable';

import { Game } from '@civ-clone/core-game';
import Rule from '@civ-clone/core-rule/Rule';
import buildCost from '../Rules/City/build-cost';
import { expect } from 'chai';
import { readFileSync } from 'fs';
import { join } from 'path';
import register from '../registerRules';
import { WONDERS_IN_ORIGINAL_ORDER, wonderHistory } from '../lib/wonderHistory';
import City from '@civ-clone/core-city/City';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import CityImprovementRegistry from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import Naval from '@civ-clone/base-unit-type-naval/Naval';
import Production from '@civ-clone/base-terrain-yield-production/Production';
import Unit from '@civ-clone/core-unit/Unit';
import WonderRegistry from '@civ-clone/core-wonder/WonderRegistry';
import buildPriority, {
  NEVER_WANTED,
  manhattanProjectRules,
} from '../Rules/City/build-priority';
import Aggressive from '@civ-clone/base-leader-trait-aggression/Aggression/Aggressive';
import Leader from '@civ-clone/core-civilization/Leader';
import Normal from '@civ-clone/base-leader-trait-aggression/Aggression/Normal';

describe('the Wonders', (): void => {
  it('are the 28 of RULES.TXT, each once, in its order', (): void => {
    expect(wonderTypes.length).to.equal(28);
    expect(new Set(wonderTypes).size).to.equal(28);
    expect(new Set(Object.values(Wonders))).to.deep.equal(new Set(wonderTypes));
    expect(wonderRows.map(([WonderType]) => WonderType)).to.deep.equal(
      wonderTypes
    );
  });

  it('need their advance, and 10 go obsolete for the world', (): void => {
    expect(requiresAdvance.length).to.equal(28);
    expect(obsoletedBy.length).to.equal(10);
    expect(obsoletedBy.every((entry) => entry.range === 'world')).true;
    expect(requiresAdvance.every((entry) => entry.range !== 'world')).true;
  });

  it('cost their rows of shields times 10', (): void => {
    const rules = buildCost(),
      cost = (WonderType: typeof Buildable): number => {
        const item = { item: () => WonderType } as unknown as BuildItem,
          [rule] = rules.filter((rule: BuildCost) => rule.validate(item));

        return (rule.process(item) as unknown as { value(): number }).value();
      };

    expect(rules.length).to.equal(28);
    expect(cost(Wonders.Pyramids as unknown as typeof Buildable)).to.equal(200);
    expect(cost(Wonders.GreatLibrary as unknown as typeof Buildable)).to.equal(
      300
    );
    expect(
      cost(Wonders.MichelangelosChapel as unknown as typeof Buildable)
    ).to.equal(400);
    expect(cost(Wonders.CureForCancer as unknown as typeof Buildable)).to.equal(
      600
    );
  });
});

describe('registerRules', (): void => {
  const game = new Game(),
    rules = (): Rule<any, any>[] =>
      (game.rules as any).entries() as Rule<any, any>[];

  register(game);

  it('registers only civ2-wonder rules (or id-less ones)', (): void => {
    const ids = rules()
      .map((rule) => rule.id())
      .filter((id): id is string => id !== null);

    expect(ids.length).to.be.greaterThan(0);
    expect(ids.filter((id) => !id.startsWith('civ2-wonder:'))).to.deep.equal(
      []
    );
    expect(ids).to.include('civ2-wonder:city/build/once');
    expect(
      ids.filter((id) =>
        id.startsWith('civ2-wonder:city/build/requires-advance/')
      ).length
    ).to.equal(28);
    expect(
      ids.filter((id) => id.startsWith('civ2-wonder:wonder/obsolete/')).length
    ).to.equal(10);
  });

  it('adds the obsolete entries to the game’s requirements, where `isObsolete` reads them', (): void => {
    expect(
      game.requirements.for(Wonders.GreatWall, 'obsoletedBy').length
    ).to.equal(1);
    expect(
      game.requirements.for(Wonders.Pyramids, 'obsoletedBy')
    ).to.deep.equal([]);
  });

  it('conflicts with civ1-wonder and depends on no civ1-* or library-* package', (): void => {
    const pkg = JSON.parse(
      readFileSync(join(process.cwd(), 'package.json'), 'utf8')
    );

    expect(pkg['civ-clone'].conflicts).to.deep.equal([
      '@civ-clone/civ1-wonder',
    ]);
    expect(
      Object.keys(pkg.dependencies).filter((name) =>
        /^@civ-clone\/(civ1|library)-/.test(name)
      )
    ).to.deep.equal([]);
  });
});

describe('build priority', (): void => {
  it('wants a ship Wonder only with a ship, and leaves the Manhattan Project to its own rule', (): void => {
    const player = {},
      city = Object.assign(Object.create(City.prototype), {
        player: () => player,
      }),
      auto = { on: false },
      cityBuild = {
        city: () => city,
        auto: () => auto.on,
      } as unknown as CityBuild,
      units: Unit[] = [],
      [rule] = buildPriority(
        { getByPlayer: () => [city] } as never,
        undefined,
        undefined,
        { getByPlayer: () => units } as never
      ),
      shields = [new Production(10)],
      wants = (Item: unknown): boolean =>
        rule.validate(cityBuild, Item as never, shields);

    expect(rule.id()).to.equal('civ2-wonder:city/build-priority/wonder');
    expect(wants(Wonders.Pyramids)).true;
    // Scored like any other Wonder here; `manhattanProjectRules` rules it out for a leader who doesn't want it.
    expect(wants(Wonders.ManhattanProject)).true;
    expect(wants(Wonders.Lighthouse)).false;

    units.push(Object.create(Naval.prototype));

    expect(wants(Wonders.Lighthouse)).true;
    expect(wants(Wonders.MagellansExpedition)).true;
    expect(
      rule.process(cityBuild, Wonders.Pyramids as never, shields)
    ).to.equal(1.5);

    // A city on Auto is ranked by civ2-city's own scores, on another scale.
    auto.on = true;

    expect(wants(Wonders.Pyramids)).false;
  });
});

describe('the Manhattan Project (civ-clone/web-renderer#1124)', (): void => {
  // A player whose leader is aggressive or not, who knows Rocketry or not, and another player, a person or not, who
  //  knows Rocketry or not, stronger or weaker.
  const setUp = ({
    aggressive = true,
    rocketry = true,
    other = {
      human: false,
      rocketry: true,
      power: 1,
    },
  }: {
    aggressive?: boolean;
    rocketry?: boolean;
    other?: { human: boolean; rocketry: boolean; power: number };
  } = {}) => {
    const LeaderType = class extends Leader {},
      civilization = {
        leader: () => ({ sourceClass: () => LeaderType }),
      },
      player = { id: 'player', civilization: () => civilization },
      rival = { id: 'rival', civilization: () => civilization },
      trait = aggressive ? new Aggressive() : new Normal(),
      knows = new Map<unknown, boolean>([
        [player, rocketry],
        [rival, other.rocketry],
      ]),
      power = new Map<unknown, number>([
        [player, 2],
        [rival, other.power],
      ]),
      dependencies = {
        // A person's client is any that isn't an `AIClient`; a computer player's is left out (none at all counts the
        //  same).
        clientRegistry: {
          getBy: (key: string, of: unknown) =>
            of === rival && other.human ? [{}] : [],
        },
        playerRegistry: { entries: () => [player, rival] },
        playerResearchRegistry: {
          getByPlayer: (of: unknown) => ({
            completed: () => knows.get(of),
          }),
        },
        // Each unit counts 1 (`MilitaryStrength`).
        ruleRegistry: {
          process: () => [{ attack: 1, defence: 0 }],
        },
        traitRegistry: {
          getByLeader: () => [trait],
        },
        unitRegistry: {
          getByPlayer: (of: unknown) => Array(power.get(of)).fill({}),
        },
      } as never;

    return { dependencies, player };
  };

  const cityBuildFor = (player: unknown, auto = false): CityBuild =>
    ({
      city: () => ({ player: () => player }),
      auto: () => auto,
    } as unknown as CityBuild);

  it("scores below nothing for a leader who isn't aggressive, or before Rocketry", (): void => {
    [setUp({ aggressive: false }), setUp({ rocketry: false })].forEach(
      ({ dependencies, player }): void => {
        const [rule] = manhattanProjectRules(dependencies);

        expect(
          rule.validate(cityBuildFor(player), Wonders.ManhattanProject as never)
        ).true;
        expect(
          rule.process(cityBuildFor(player), Wonders.ManhattanProject as never)
        ).to.equal(NEVER_WANTED);
      }
    );
  });

  it('scores below nothing while a person who knows Rocketry is weaker, as the original', (): void => {
    const weaker = setUp({
        other: { human: true, rocketry: true, power: 1 },
      }),
      stronger = setUp({
        other: { human: true, rocketry: true, power: 3 },
      }),
      score = ({ dependencies, player }: ReturnType<typeof setUp>) =>
        manhattanProjectRules(dependencies)[0].process(
          cityBuildFor(player),
          Wonders.ManhattanProject as never
        );

    expect(score(weaker)).to.equal(NEVER_WANTED);
    expect(score(stronger)).to.equal(0);
  });

  it("adds nothing to an aggressive leader's score once it knows Rocketry, and asks about nothing else", (): void => {
    const { dependencies, player } = setUp(),
      [rule] = manhattanProjectRules(dependencies);

    expect(
      rule.process(cityBuildFor(player), Wonders.ManhattanProject as never)
    ).to.equal(0);
    expect(rule.validate(cityBuildFor(player), Wonders.Pyramids as never))
      .false;
    // A city on Auto is ranked by civ2-city.
    expect(
      rule.validate(
        cityBuildFor(player, true),
        Wonders.ManhattanProject as never
      )
    ).false;
  });
});

describe('wonderHistory', (): void => {
  it('lists Wonders in RULES.TXT order', (): void => {
    expect(WONDERS_IN_ORIGINAL_ORDER).to.equal(wonderTypes);
    expect(
      wonderHistory(new WonderRegistry(), new CityImprovementRegistry())
    ).to.deep.equal([]);
  });
});
