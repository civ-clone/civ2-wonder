import * as Wonders from '../Wonders';
import { DARWINS_VOYAGE_ADVANCES } from '../lib/darwinsVoyage';
import { EffectDescription } from '@civ-clone/core-rule/Description';
import { GREAT_LIBRARY_HOLDERS } from '../Rules/Player/research-complete';
import { Movement } from '@civ-clone/core-unit/Yields';
import Production from '@civ-clone/base-terrain-yield-production/Production';
import Research from '@civ-clone/base-city-yield-research/Research';
import Rule from '@civ-clone/core-rule/Rule';
import Trade from '@civ-clone/base-terrain-yield-trade/Trade';
import Unhappiness from '@civ-clone/base-city-yield-unhappiness/Unhappiness';
import Yield from '@civ-clone/core-yield/Yield';
import anarchyDuration from '../Rules/Player/anarchy-duration';
import availability from '../Rules/Governments/availability';
import buildingComplete from '../Rules/City/building-complete';
import cityCost from '../Rules/City/cost';
import cityTileYield from '../Rules/City/tile-yield';
import cityYield from '../Rules/City/yield';
import cityYieldModifier from '../Rules/City/yield-modifier';
import diplomacy, {
  EIFFEL_TOWER_ATTITUDE,
  MANHATTAN_PROJECT_REPUTATION,
} from '../lib/diplomacy';
import {
  EIFFEL_TOWER_COMPLETE_RULE,
  MANHATTAN_PROJECT_COMPLETE_RULE,
} from '../RuleIds';
import { expect } from 'chai';
import { greatLibraryRules } from '@civ-clone/base-wonder/lib/greatLibraryRules';
import promotionChance from '../Rules/Unit/promotion-chance';
import researchComplete from '../Rules/Player/research-complete';
import unitYield from '../Rules/Unit/yield';

// What the Wonders say they do, for the Civilopedia (civ-clone/web-renderer#1196), checked against what their rules do
//  where a rule can be run on its own. Each number is one constant that the rule and its description both read.

const describedBy = (rules: Rule[]): [Rule, EffectDescription][] =>
    rules.flatMap((rule) =>
      rule
        .descriptions()
        .map((description): [Rule, EffectDescription] => [rule, description])
    ),
  allRules = (): Rule[] => [
    ...anarchyDuration(),
    ...availability(),
    ...buildingComplete(),
    ...cityCost(),
    ...cityTileYield(),
    ...cityYield(),
    ...cityYieldModifier(),
    ...diplomacy(),
    ...promotionChance(),
    ...researchComplete(),
    ...unitYield(),
  ],
  // The one rule describing `subject` with `type` in `rules`, and its description.
  only = (
    rules: Rule[],
    subject: Function,
    type: string
  ): [Rule, EffectDescription][] =>
    describedBy(rules).filter(
      ([, description]) =>
        description.subject === subject && description.type === type
    );

describe('descriptions', (): void => {
  it('every Wonder says what it does, bar those civ2-city-improvement, civ2-unit and civ2-city-happiness describe', (): void => {
    const subjects = new Set(
      describedBy(allRules()).map(([, description]) => description.subject)
    );

    expect(
      Object.values(Wonders)
        .filter((WonderType) => !subjects.has(WonderType))
        .map((WonderType) => WonderType.name)
        .sort()
    ).to.eql(
      [
        // civ2-city-improvement applies these.
        'AdamSmithsTradingCompany',
        'HooverDam',
        'IsaacNewtonsCollege',
        'MichelangelosChapel',
        'Oracle',
        'Pyramids',
        'SetiProgram',
        // civ2-unit: the Great Wall as City Walls.
        'GreatWall',
        // civ2-city-happiness: Women's Suffrage as a Police Station.
        'WomensSuffrage',
      ].sort()
    );
  });

  it('each Wonder says each thing once', (): void => {
    const lines = describedBy(allRules()).map(
      ([, description]) =>
        `${(description.subject as Function).name} ${description.type} ${
          description.step ?? ''
        } ${description.on ?? ''}`
    );

    expect(lines).to.eql([...new Set(lines)]);
  });

  it('the happiness Wonders make as many happy as they say', (): void => {
    const { HangingGardens, CureForCancer } = Wonders,
      rules = cityYield();

    [HangingGardens, CureForCancer].forEach((subject) =>
      describedBy(rules)
        .filter(([, description]) => description.subject === subject)
        .forEach(([rule, description]) =>
          expect((rule.process({}) as Yield).value()).to.equal(
            description.value
          )
        )
    );

    expect(
      describedBy(rules).map(([, { value, step, scope }]) => [
        value,
        step,
        scope,
      ])
    ).to.eql([
      [1, undefined, 'player'],
      [2, 'more', undefined],
      [1, undefined, 'player'],
    ]);
  });

  it("J. S. Bach's makes as many content as it says, Shakespeare's all", (): void => {
    const { JsBachsCathedral, ShakespearesTheatre } = Wonders,
      rules = cityCost(),
      [[bach, bachDescription]] = only(rules, JsBachsCathedral, 'content'),
      [[shakespeare, shakespeareDescription]] = only(
        rules,
        ShakespearesTheatre,
        'content'
      );

    expect((bach.process({}, [new Unhappiness(5)]) as Yield).value()).to.equal(
      -(bachDescription.value as number)
    );
    expect(bachDescription.value).to.equal(2);
    expect(shakespeareDescription.amount).to.equal('all');
    expect(
      (shakespeare.process({}, [new Unhappiness(5)]) as Yield).value()
    ).to.equal(-5);
  });

  it('the Colossus and King Richard’s add what they say to a square', (): void => {
    const { Colossus, KingRichardsCrusade } = Wonders,
      rules = cityTileYield(),
      added = (rule: Rule): Yield[] => {
        const yields: Yield[] = [];

        rule.process({}, {}, yields);

        return yields;
      };

    only(rules, Colossus, 'tile_yield').forEach(([rule, description]) => {
      const [tileYield] = added(rule);

      expect(tileYield).to.be.instanceOf(Trade);
      expect(description.yield).to.equal(Trade);
      expect(tileYield.value()).to.equal(description.value);
    });
    expect(only(rules, Colossus, 'tile_yield').map(([, { on }]) => on)).to.eql([
      'ocean',
      'land_producing',
    ]);

    const [[kingRichards, kingRichardsDescription]] = only(
        rules,
        KingRichardsCrusade,
        'tile_yield'
      ),
      [shields] = added(kingRichards);

    expect(shields).to.be.instanceOf(Production);
    expect(kingRichardsDescription.yield).to.equal(Production);
    expect(shields.value()).to.equal(kingRichardsDescription.value);
  });

  it('the Copernicus Observatory adds the share of the science it says', (): void => {
    const [[rule, description]] = only(
      cityYieldModifier(),
      Wonders.CopernicusObservatory,
      'yield_percent'
    );

    expect(description.of).to.equal('total');
    expect((rule.process({}, [new Research(30)]) as Yield).value()).to.equal(
      30 * (description.value as number)
    );
  });

  it('the Lighthouse and Magellan’s add the moves they say', (): void => {
    const { Lighthouse, MagellansExpedition } = Wonders,
      rules = unitYield();

    [Lighthouse, MagellansExpedition].forEach((subject) => {
      const [[rule, description]] = only(rules, subject, 'unit_movement'),
        movement = new Movement(3);

      rule.process({}, movement);

      expect(movement.value()).to.equal(3 + (description.value as number));
    });
  });

  it('the Statue of Liberty gives the Anarchy it says', (): void => {
    const [[rule, description]] = only(
      anarchyDuration(),
      Wonders.StatueOfLiberty,
      'anarchy_turns'
    );

    expect(rule.process({})).to.equal(description.value);
    expect(
      only(availability(), Wonders.StatueOfLiberty, 'any_government')
    ).to.have.length(1);
  });

  it("the Great Library's rule is base-wonder's, saying how many civilizations share an advance", (): void => {
    const [[rule, description]] = only(
        researchComplete(),
        Wonders.GreatLibrary,
        'shared_advances'
      ),
      [base] = greatLibraryRules({
        GreatLibrary: Wonders.GreatLibrary,
        holders: GREAT_LIBRARY_HOLDERS,
      });

    expect(description.value).to.equal(GREAT_LIBRARY_HOLDERS);
    expect(rule).to.be.instanceOf(base.constructor);
    expect(rule.id()).to.equal(base.id());
    expect(rule.priority().value()).to.equal(base.priority().value());
  });

  it('the Eiffel Tower and the Manhattan Project say what they do as they are built (civ-clone/web-renderer#1291)', (): void => {
    const rules = diplomacy(),
      { EiffelTower, ManhattanProject } = Wonders;

    [
      ['reputation_halved', undefined],
      ['attitude_improved', EIFFEL_TOWER_ATTITUDE],
      ['vendettas_end', undefined],
    ].forEach(([type, value]) => {
      const [[rule, description]] = only(rules, EiffelTower, type as string);

      expect(rule.id()).to.equal(EIFFEL_TOWER_COMPLETE_RULE);
      expect(description.value).to.equal(value);
    });
    expect(EIFFEL_TOWER_ATTITUDE).to.equal(25);

    const [[manhattan, recovers]] = only(
      rules,
      ManhattanProject,
      'reputation_recovers'
    );

    expect(manhattan.id()).to.equal(MANHATTAN_PROJECT_COMPLETE_RULE);
    expect(recovers.value).to.equal(MANHATTAN_PROJECT_REPUTATION);
    expect(recovers.scope).to.equal('world');
    expect(MANHATTAN_PROJECT_REPUTATION).to.equal(6);
  });

  it("Darwin's Voyage completes the research it says", (): void => {
    const [[, description]] = only(
      buildingComplete(),
      Wonders.DarwinsVoyage,
      'free_advances'
    );

    expect(description.value).to.equal(DARWINS_VOYAGE_ADVANCES);
    expect(DARWINS_VOYAGE_ADVANCES).to.equal(2);
  });
});
