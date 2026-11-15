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
import buildPriority from '../Rules/City/build-priority';

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
  it('never wants the Manhattan Project, and a ship Wonder only with a ship', (): void => {
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
    expect(wants(Wonders.ManhattanProject)).false;
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

describe('wonderHistory', (): void => {
  it('lists Wonders in RULES.TXT order', (): void => {
    expect(WONDERS_IN_ORIGINAL_ORDER).to.equal(wonderTypes);
    expect(
      wonderHistory(new WonderRegistry(), new CityImprovementRegistry())
    ).to.deep.equal([]);
  });
});
