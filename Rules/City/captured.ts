import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import leonardoUpgrade, {
  LeonardoRegistries,
  afterStolenAdvance,
} from '../../lib/leonardo';
import Captured from '@civ-clone/core-city/Rules/Captured';
import City from '@civ-clone/core-city/City';
import Effect from '@civ-clone/core-rule/Effect';
import { LeonardosWorkshop } from '../../Wonders';
import Player from '@civ-clone/core-player/Player';
import { cityHasWonder } from '@civ-clone/base-wonder/lib/hasWonder';

/** civ2-science's rule that takes an advance from a captured city, whose captor's client chooses it. */
export const STEAL_ADVANCE_RULE = 'civ2-science:city/captured/steal-advance';

// OpenCiv2 `city_capture_aftermath` (`src/auto/city.cpp`, richardpenman/civ2@49f26ec): the city is already the captor's
//  (line 4991); `civ_steal_advance` (5525) gives the captor an advance through `civ_give_advance`, which runs
//  `civ_leonardo_upgrade` once; then, when the city is Leonardo's Workshop's (`wonder_get_city`, so not once it has
//  expired), it runs again for the captor (5542). Here the steal waits for the captor's client to choose
//  (civ2-science's rule awaits `takeAdvance`), so the advance arrives after every `Captured` rule has run. When the
//  steal will happen, this pass waits for that advance and runs straight after its own pass
//  (`Rules/Player/research-complete`), so a unit can still go two steps, as in the original.
export const getRules = (
  registries: LeonardoRegistries = {},
  ruleRegistry: RuleRegistry = ruleRegistryInstance
): Captured[] => {
  const upgrade = leonardoUpgrade(registries),
    stealing = (
      city: City,
      captor: Player,
      player: Player,
      cause: unknown
    ): boolean =>
      ruleRegistry
        .get(Captured)
        .some(
          (rule: Captured): boolean =>
            rule.id() === STEAL_ADVANCE_RULE &&
            rule.validate(city, captor, player, cause)
        );

  return [
    new Captured(
      'civ2-wonder:city/captured/leonardos-workshop',
      cityHasWonder(
        LeonardosWorkshop,
        registries.wonderRegistry,
        registries.playerResearchRegistry,
        registries.requirementRegistry
      ),
      new Effect(
        (city: City, captor: Player, player: Player, cause: unknown): void => {
          if (stealing(city, captor, player, cause)) {
            afterStolenAdvance(captor);

            return;
          }

          upgrade(captor);
        }
      )
    ),
  ];
};

export default getRules;
