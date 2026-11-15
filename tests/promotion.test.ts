import { PromotionChance } from '@civ-clone/base-unit-veteran-promotion/lib/Rules';
import { SunTzusWarAcademy } from '../Wonders';
import Unit from '@civ-clone/core-unit/Unit';
import UnitYield from '@civ-clone/core-unit/Rules/Yield';
import { expect } from 'chai';
import promotionChance from '../Rules/Unit/promotion-chance';
import { setUp } from './lib/setUp';
import unitYield, { BEFORE_DAMAGE } from '../Rules/Unit/yield';

describe('units', (): void => {
  it("Sun Tzu's War Academy: every winner of its owner's is promoted (`unit_resolve_attack_veterans`)", (): void => {
    const {
        ruleRegistry,
        wonderRegistry,
        playerResearchRegistry,
        requirementRegistry,
        players,
        city,
        build,
      } = setUp(),
      winner = (player: unknown): Unit =>
        Object.assign(Object.create(Unit.prototype), {
          player: () => player,
        });

    ruleRegistry.register(
      ...promotionChance(
        wonderRegistry,
        playerResearchRegistry,
        requirementRegistry
      )
    );

    const chance = (unit: Unit): (number | undefined)[] =>
      ruleRegistry.process(PromotionChance, unit, unit, null as never);

    expect(chance(winner(players[0]))).to.deep.equal([]);

    build(new SunTzusWarAcademy(city(players[0])));

    expect(chance(winner(players[0]))).to.deep.equal([1]);
    expect(chance(winner(players[1]))).to.deep.equal([]);
  });

  it("adds the Lighthouse's and Magellan's moves before civ2-unit's Low damaged-movement rule", (): void => {
    expect(BEFORE_DAMAGE).to.be.above(2000).and.below(3000);
    unitYield().forEach((rule: UnitYield): void => {
      expect(rule.priority().value()).to.equal(BEFORE_DAMAGE);
    });
  });
});
