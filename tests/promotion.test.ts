import { PromotionChance } from '@civ-clone/base-unit-veteran-promotion/lib/Rules';
import { SunTzusWarAcademy } from '../Wonders';
import Unit from '@civ-clone/core-unit/Unit';
import UnitYield from '@civ-clone/core-unit/Rules/Yield';
import Naval from '@civ-clone/base-unit-type-naval/Naval';
import { MagellansExpedition } from '../Wonders';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import { Movement } from '@civ-clone/core-unit/Yields';
import Yield from '@civ-clone/core-yield/Yield';
import damagedMovementRules from '@civ-clone/base-unit-healing/lib/damagedMovementRules';
import { expect } from 'chai';
import promotionChance from '../Rules/Unit/promotion-chance';
import { setUp } from './lib/setUp';
import unitYield, { BEFORE_DAMAGE } from '../Rules/Unit/yield';

class Galleon extends Naval {}

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

  it("adds Magellan's moves before civ2-unit's Low damaged-movement rule, whichever is registered first (`unit_max_moves`)", (): void => {
    const {
        ruleRegistry,
        wonderRegistry,
        playerResearchRegistry,
        requirementRegistry,
        players,
        city,
        build,
      } = setUp(),
      // A Galleon-like ship of 4 moves, 30 hit points with 10 left.
      ship = Object.assign(Object.create(Galleon.prototype), {
        player: () => players[0],
        hasTrait: (): boolean => false,
        hitPoints: (): [number, number] => [10, 30],
        damage: (): number => 20,
      }) as Unit;

    build(new MagellansExpedition(city(players[0])));

    // The damage rule first, as if civ2-unit loaded before civ2-wonder.
    ruleRegistry.register(
      ...damagedMovementRules({ stepsPerMove: 3, minimum: (): number => 2 }),
      new UnitYield(
        new Criterion(
          (unit: Unit, unitYield: Yield): boolean =>
            unitYield instanceof Movement
        ),
        new Effect((unit: Unit, unitYield: Yield): void => unitYield.set(4))
      ),
      ...unitYield(wonderRegistry, playerResearchRegistry, requirementRegistry)
    );

    const movement = new Movement();

    ruleRegistry.process(UnitYield, ship, movement);

    // 4 + 2 = 6 moves, 18 thirds × 10 / 30 = 6 thirds: 2 moves. Cut first, it would be 2 + 2 = 4.
    expect(movement.value()).to.equal(2);
    expect(BEFORE_DAMAGE).to.be.above(2000).and.below(3000);
  });
});
