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
import Civilization from '@civ-clone/core-civilization/Civilization';
import Created from '@civ-clone/core-diplomacy/Rules/Interaction/Created';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import { EIFFEL_TOWER_APPLIED } from '../RuleIds';
import { Game } from '@civ-clone/core-game';
import Interaction from '@civ-clone/core-diplomacy/Interaction';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import { gameForLoad } from '@civ-clone/core-save-game/gameForLoad';
import { hydrate } from '@civ-clone/core-save-game/hydrate';
import { registerClasses } from '@civ-clone/core-save-game/registerClasses';
import { save } from '@civ-clone/core-save-game/save';
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

      it('makes no contact', (): void => {
        const {
          players: [owner, a],
          interactionRegistry,
          complete,
          capture,
        } = game();

        const wonder = complete(owner, WonderType);

        capture(wonder, a);

        expect(contacts(interactionRegistry, owner, a)).equal(0);
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
    it('lowers by 25 the attitude, as civ2-diplomacy seeds it, of a player that meets its owner later', (): void => {
      const {
        players: [owner, a, b],
        interactionRegistry,
        ruleRegistry,
        relations,
        complete,
      } = game();

      // civ2-diplomacy's seeding, registered after civ2-wonder's rule: `Low` still runs it after.
      ruleRegistry.register(
        new Created(
          new Criterion(
            (interaction: Interaction): boolean =>
              interaction instanceof Contact
          ),
          new Effect((interaction: Interaction): void => {
            const [x, y] = interaction.players();

            attitude(relations).set(x, y, 60);
            attitude(relations).set(y, x, 60);
          })
        )
      );

      complete(owner, EiffelTower);

      interactionRegistry.register(new Contact(a, owner, ruleRegistry));
      interactionRegistry.register(new Contact(a, b, ruleRegistry));

      expect(attitude(relations).get(a, owner)).equal(35);
      expect(attitude(relations).get(owner, a)).equal(60);
      expect(attitude(relations).get(a, b)).equal(60);
      expect(attitude(relations).get(b, a)).equal(60);
    });

    it('keeps the mark that it was applied through a save', (): void => {
      class Greek extends Civilization {}
      class English extends Civilization {}

      const play = new Game(),
        owner = new Player(play.rules),
        other = new Player(play.rules);

      play.engine.registerPlugins({ '@civ-clone/civ2-wonder': 'test' });
      registerClasses(play);
      play.classes.register(Greek, English);
      owner.setCivilization(new Greek());
      other.setCivilization(new English());
      play.players.register(owner, other);

      const rulesFor = (target: Game) =>
          diplomacy({
            interactionRegistry: target.interactions,
            pendingEffectRegistry: target.pendingEffects,
            playerRegistry: target.players,
            playerResearchRegistry: target.playerResearch,
            requirementRegistry: target.requirements,
            ruleRegistry: target.rules,
            turn: target.turn,
            wonderRegistry: target.wonders,
          }),
        completeFor = (target: Game, player: Player): void => {
          const city = Object.assign(Object.create(City.prototype), {
            player: () => player,
          });

          target.rules.process(
            BuildingComplete,
            Object.assign(Object.create(CityBuild.prototype), {
              city: () => city,
            }) as CityBuild,
            new EiffelTower(city, target.rules)
          );
        },
        relationsOf = (target: Game) => ({
          interactionRegistry: target.interactions,
          ruleRegistry: target.rules,
          turn: target.turn,
        });

      play.rules.register(...rulesFor(play));
      reputation(relationsOf(play)).set(owner, 6);
      completeFor(play, owner);

      expect(reputation(relationsOf(play)).get(owner)).equal(3);

      const loaded = gameForLoad({
        classes: play.classes,
        engine: play.engine,
        rules: new RuleRegistry(),
      });

      hydrate(save(play, { name: 'test', createdAt: 0 }), loaded);
      loaded.rules.register(...rulesFor(loaded));

      const [loadedOwner, loadedOther] = loaded.players.entries();

      expect(
        loaded.pendingEffects
          .getByTarget(loadedOwner)
          .map((pendingEffect) => pendingEffect.handler())
      ).eql([EIFFEL_TOWER_APPLIED]);

      completeFor(loaded, loadedOwner);
      completeFor(loaded, loadedOther);

      // Not again for its owner; once for the other.
      expect(reputation(relationsOf(loaded)).get(loadedOwner)).equal(3);
      expect(
        loaded.pendingEffects.getByTarget(loadedOther).map((p) => p.handler())
      ).eql([EIFFEL_TOWER_APPLIED]);
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
