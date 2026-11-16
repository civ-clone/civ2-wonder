import {
  EiffelTower,
  ManhattanProject,
  MarcoPolosEmbassy,
  UnitedNations,
} from '../Wonders';
import { attitude, reputation } from '@civ-clone/civ2-diplomacy/lib/relations';
import Barbarian from '@civ-clone/base-civilization-barbarian/Barbarian';
import BuildingComplete from '@civ-clone/core-city-build/Rules/BulidingComplete';
import Captured from '@civ-clone/core-city/Rules/Captured';
import City from '@civ-clone/core-city/City';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import { Communism } from '@civ-clone/civ2-science/Advances';
import Contact from '@civ-clone/base-diplomacy-interaction-contact/Contact';
import InteractionRegistry from '@civ-clone/core-diplomacy/InteractionRegistry';
import { Never } from '@civ-clone/core-diplomacy/Expiries';
import { PendingEffectRegistry } from '@civ-clone/core-pending-effect';
import Player from '@civ-clone/core-player/Player';
import PlayerRegistry from '@civ-clone/core-player/PlayerRegistry';
import Turn from '@civ-clone/core-turn-based-game/Turn';
import Vendetta from '@civ-clone/library-diplomacy/Declarations/Vendetta';
import Wonder from '@civ-clone/core-wonder/Wonder';
import { expect } from 'chai';
import diplomacy from '../lib/diplomacy';
import hasEmbassy from '@civ-clone/base-diplomacy/lib/embassy';
import setUp from './lib/setUp';

// The diplomatic parts of Civ2's wonders that civ2-wonder applies (OpenCiv2 richardpenman/civ2@e39fe7b): embassies and
//  contact for Marco Polo's and the United Nations, `civ_apply_eiffel_tower` (`civ.cpp:6794-6812`) and the Manhattan
//  Project's reputation (`city_production.cpp:2435-2438`).

const game = () => {
  const set = setUp(),
    interactionRegistry = new InteractionRegistry(),
    pendingEffectRegistry = new PendingEffectRegistry(),
    playerRegistry = new PlayerRegistry(),
    turn = new Turn(),
    barbarian = Object.assign(new Player(set.ruleRegistry), {
      civilization: () => new Barbarian(),
    });

  playerRegistry.register(...set.players, barbarian);

  set.ruleRegistry.register(
    ...diplomacy({
      ...set.registries,
      interactionRegistry,
      pendingEffectRegistry,
      playerRegistry,
      ruleRegistry: set.ruleRegistry,
      turn,
    })
  );

  const relations = {
      interactionRegistry,
      ruleRegistry: set.ruleRegistry,
      turn,
    },
    cities = new Map<Player, City>(),
    cityOf = (player: Player): City => {
      if (!cities.has(player)) {
        cities.set(player, set.city(player));
      }

      return cities.get(player)!;
    },
    // A wonder `player` builds: registered, then the `BuildingComplete` rules, as `CityBuild#build` does.
    complete = (player: Player, WonderType: typeof Wonder): Wonder => {
      const city = cityOf(player),
        wonder = set.build(new WonderType(city, set.ruleRegistry));

      set.ruleRegistry.process(
        BuildingComplete,
        Object.assign(Object.create(CityBuild.prototype), {
          city: () => city,
        }) as CityBuild,
        wonder
      );

      return wonder;
    },
    // `captor` takes the city with `wonder` in it: the city is the captor's, then the `Captured` rules.
    capture = (wonder: Wonder, captor: Player): void => {
      const city = wonder.city(),
        player = city.player();

      (city as unknown as { player: () => Player }).player = () => captor;
      set.ruleRegistry.process(Captured, city, captor, player, null);
    },
    met = (a: Player, b: Player, value = 50): void => {
      interactionRegistry.register(new Contact(a, b, set.ruleRegistry, turn));
      attitude(relations).set(a, b, value);
      attitude(relations).set(b, a, value);
    };

  return {
    ...set,
    interactionRegistry,
    pendingEffectRegistry,
    relations,
    barbarian,
    complete,
    capture,
    met,
  };
};

const contacts = (
  interactionRegistry: InteractionRegistry,
  a: Player,
  b: Player
): number =>
  interactionRegistry
    .getByPlayers(a, b)
    .filter((interaction) => interaction instanceof Contact).length;

describe('diplomatic wonders', (): void => {
  for (const WonderType of [MarcoPolosEmbassy, UnitedNations]) {
    describe(WonderType.name, (): void => {
      it('acts as an embassy with every other player for its owner, one way, until it expires', (): void => {
        const {
          players: [owner, other],
          interactionRegistry,
          ruleRegistry,
          research,
          complete,
        } = game();

        expect(hasEmbassy({ interactionRegistry, ruleRegistry }, owner, other))
          .to.false;

        complete(owner, WonderType);

        expect(hasEmbassy({ interactionRegistry, ruleRegistry }, owner, other))
          .to.true;
        expect(hasEmbassy({ interactionRegistry, ruleRegistry }, other, owner))
          .to.false;

        // Marco Polo's expires with Communism, discovered by anyone; the United Nations doesn't.
        research[3].addAdvance(Communism);

        expect(
          hasEmbassy({ interactionRegistry, ruleRegistry }, owner, other)
        ).equal(WonderType === UnitedNations);
      });

      it('makes contact between its builder or captor and every other player but the barbarians, once a pair', (): void => {
        const {
          players: [owner, a, b, captor],
          barbarian,
          interactionRegistry,
          complete,
          capture,
        } = game();

        interactionRegistry.register(new Contact(owner, a));

        const wonder = complete(owner, WonderType);

        expect(contacts(interactionRegistry, owner, a)).equal(1);
        expect(contacts(interactionRegistry, owner, b)).equal(1);
        expect(contacts(interactionRegistry, owner, captor)).equal(1);
        expect(contacts(interactionRegistry, owner, barbarian)).equal(0);
        expect(contacts(interactionRegistry, a, b)).equal(0);

        capture(wonder, captor);

        expect(contacts(interactionRegistry, captor, a)).equal(1);
        expect(contacts(interactionRegistry, captor, b)).equal(1);
      });
    });
  }

  describe('the Eiffel Tower', (): void => {
    it("halves its builder's reputation, rounded down, lowers every other player's attitude to it by 25 and ends their vendettas against it", (): void => {
      const {
        players: [owner, a, b, c],
        interactionRegistry,
        ruleRegistry,
        relations,
        complete,
        met,
      } = game();

      reputation(relations).set(owner, 5);
      met(owner, a, 50);
      met(owner, b, 10);
      interactionRegistry.register(
        new Vendetta(a, owner, new Never(), ruleRegistry),
        new Vendetta(owner, b, new Never(), ruleRegistry)
      );

      complete(owner, EiffelTower);

      const attitudes = attitude(relations);

      expect(reputation(relations).get(owner)).equal(2);
      expect(attitudes.get(a, owner)).equal(25);
      // Not below 0.
      expect(attitudes.get(b, owner)).equal(0);
      // Its owner's own attitudes don't move.
      expect(attitudes.get(owner, a)).equal(50);
      // A player it hasn't met has no attitude to change.
      expect(attitudes.get(c, owner)).undefined;

      const vendettas = interactionRegistry
        .entries()
        .filter(
          (interaction): interaction is Vendetta =>
            interaction instanceof Vendetta && interaction.active()
        );

      // The one against it ends; its own against another stays.
      expect(vendettas.map((vendetta) => vendetta.players())).eql([[owner, b]]);
    });

    it('applies once to each player: again for a captor, never twice for the same one', (): void => {
      const {
        players: [owner, a, captor],
        relations,
        complete,
        capture,
        met,
      } = game();

      met(owner, a, 80);
      met(captor, a, 80);
      reputation(relations).set(owner, 4);
      reputation(relations).set(captor, 3);

      const wonder = complete(owner, EiffelTower);

      capture(wonder, captor);

      expect(attitude(relations).get(a, captor)).equal(55);
      expect(reputation(relations).get(captor)).equal(1);

      capture(wonder, owner);

      expect(attitude(relations).get(a, owner)).equal(55);
      expect(reputation(relations).get(owner)).equal(2);
    });
  });

  describe('the Manhattan Project', (): void => {
    it("sets every player's reputation to (reputation + 1) / 2, rounded down, at most 6", (): void => {
      const {
        players: [owner, a, b, c],
        relations,
        complete,
      } = game();

      reputation(relations).set(a, 1);
      reputation(relations).set(b, 4);
      reputation(relations).set(c, 20);

      complete(owner, ManhattanProject);

      expect(
        [owner, a, b, c].map((player) => reputation(relations).get(player))
      ).eql([0, 1, 2, 6]);
    });

    it('leaves a player with no reputation without a record', (): void => {
      const {
        players: [owner],
        interactionRegistry,
        complete,
      } = game();

      complete(owner, ManhattanProject);

      expect(interactionRegistry.entries()).length(0);
    });
  });
});
