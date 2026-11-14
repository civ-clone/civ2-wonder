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
