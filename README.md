# civ2-wonder

Civilization II's 28 Wonders of the World, as rules on `base-wonder`. It mirrors `civ1-wonder`, under `civ2-wonder:`
ids, with Civ2's numbers from OpenCiv2's reconstruction of the original (richardpenman/civ2@49f26ec).

- **Wonders:** RULES.TXT's @IMPROVE rows 39 to 66, each from its own `base-wonder-*` package. That's the 21 shared with
  Civilization and 7 of Civ2's own. `data/wonders.ts` holds the numbers (cost, prerequisite, expiry), each row cited.
  `tests/rulesTxt.test.ts` checks them against a local copy when `CIV2_PATH` names its folder:
  `CIV2_PATH=~/Code/civ-clone/civ2 npm test`.
- **Building:**
  - Each Wonder needs its advance and costs its rows × 10 shields.
  - It's built once in the world and never again, even once lost with its city.
  - Rivals' builds of it are dropped when it's completed.
  - A Caravan (a unit that `TradeMissions`) can help build one.
  - The computer players want one as `civ1-wonder`'s do (base-wonder's `wonderPriorityRules`).
- **History:** `lib/wonderHistory`, every Wonder ever built in RULES.TXT's order, for a Wonders of the World report.
- **Expiry** (@ENDWONDER): a Wonder stops working once *anyone* has the advance, and is announced obsolete then.
- **Effects** whose shape the base rules have:
  - **Colossus** and **King Richard's Crusade**, per square (`Rules/City/tile-yield`, `CityTileYield` rules at
    civ2-city's `lib/tileYieldPipeline` steps, as OpenCiv2's `city_tile_yield` adds them):
    - the Colossus: +1 trade on every ocean square its city works, whatever its trade (`colossusOcean`), and on a
      land square that has any trade after its river and road (`colossusLand`). The game's player-facing descriptions
      say ocean squares only; the code does both;
    - King Richard's Crusade: +1 shield on every square its city works, ocean included (`kingRichards`).

    The railroad, the government's penalty and bonus, Superhighways and pollution are later steps, so they see the +1:
    under Despotism a 2-trade ocean square stays at 2 (3, less the penalty), unless the city celebrates.
  - **Hanging Gardens:** 1 happy citizen in each of its owner's cities, 3 in its own.
  - **Cure for Cancer:** 1 happy citizen in each of its owner's cities.
  - **Shakespeare's Theatre:** no unhappy citizens in its city.
  - **J. S. Bach's Cathedral:** 2 fewer unhappy in each of its owner's cities.
  - **Copernicus Observatory:** doubles its city's science, after the rest.
  - **Lighthouse:** +1 move for ships that aren't coast-bound.
  - **Magellan's Expedition:** +2 moves for ships. Both are added before a damaged ship is slowed (civ2-unit's `Low`
    rule), whichever package loads first.
  - **Sun Tzu's War Academy:** every winner of its owner's becomes a veteran (`PromotionChance` 1).
  - **Great Library:** an advance known by 2 civilizations, barbarians not counted, however they gained it (`addAdvance` processes `Complete` too, so huts, treaties and Philosophy count, as in `civ_give_advance`).
  - **Darwin's Voyage:** two research completions, each spending the progress towards it (`lib/darwinsVoyage`;
    `civ_research_complete` sets the progress to 0, where base-wonder's free completions keep it).
  - **Leonardo's Workshop** (`lib/leonardo`, civ2-unit's `lib/upgrade`, base-unit-upgrade): every unit of its owner's
    that has an upgrade becomes it at once, one step each, and stops being a veteran (`civ_leonardo_upgrade`). It runs
    each time its owner is given an advance, however (`civ_give_advance`), when it's completed, and for whoever
    captures its city (`city_capture_aftermath`). That last pass waits for the advance the captor takes from the city
    (civ2-science's steal, which waits for the captor's choice) and runs after that advance's own pass, as in the
    original, so a unit can go two steps. The wait isn't saved: a game saved while the captor chooses loses the pass. Once anyone knows Automobile it does nothing, including for the advance
    that expires it. Clients hear `unit:upgraded` for each unit.
  - **Apollo Program:** when it's completed, every player sees every square of the map (`wonder_apollo_reveal_map`
    reveals it to all, not only its builder), and `wonder:apollo-revealed` is emitted. Its spaceship gate is
    civ2-spaceship's: once anyone has built it, even if it's lost since, every city may build spaceship parts
    (`civ2-spaceship:city/build/requires-apollo`), and every player gets a ship to put them in.
  - **Statue of Liberty:** any government, and Anarchy ends next turn.
  - **Diplomacy** (`lib/diplomacy`, M2d): **Marco Polo's Embassy** and **the United Nations** act as an embassy with
    every other player for their owner (base-diplomacy's `HasEmbassy`, setting no `Embassy`), until they expire; they
    make no contact. **The Eiffel Tower**, once for each player that builds or captures it (`civ_apply_eiffel_tower`):
    its reputation is halved, every other player likes it 25 better (one that meets it later, once civ2-diplomacy has
    seeded its attitude), and every vendetta against it ends. That it was applied is saved as a `PendingEffect`. **The Manhattan Project**, when it's built: every player's
    reputation becomes (reputation + 1) / 2, at most 6. The rest of these wonders' diplomacy is civ2-diplomacy's, which
    reads who owns them itself: the talks (Marco Polo's dearer tribute, the United Nations' and the Great Wall's peace,
    overruled refusals, no tribute and warmer talks), share maps without an alliance, the United Nations' Senate, and
    the Eiffel Tower's recovery and patience. civ2-unit hides Establish Embassy from the United Nations' owner.
- **Not here, by design:** a Wonder that acts as an improvement in every city is tested with it, at the improvement's
  site (base-wonder's `hasImprovementOrWonder`, in civ2-city-improvement and civ2-unit). That covers Pyramids/Granary,
  Michelangelo's/Cathedral, Women's Suffrage/Police Station, Great Wall/City Walls, SETI/Research Lab, Hoover
  Dam/Hydro Plant, Sun Tzu's/Barracks, Lighthouse/Port Facility, and the Oracle's Temple. civ2-city-improvement also
  owns Isaac Newton's College (part of the science buildings' bonus), Adam Smith's (upkeep), J. S. Bach's tithes under
  Fundamentalism (its `lib/content`; the 2 fewer unhappy stay here), and registering every
  improvement, Wonders included, in `cityImprovements` (its `Created` rule), which a lost Wonder's `everBuilt` reads. civ2-unit reads the
  Manhattan Project for nuclear weapons.

## A computer player's Wonders

- **Build priority** (`Rules/City/build-priority`, for a city not on Auto): base-wonder's Wonder priority with
  civ1-wonder's numbers; the Lighthouse and Magellan's only for a player with a ship.
- **The Manhattan Project** (`manhattanProjectRules`, civ-clone/web-renderer#1124): wanted only by a computer player
  whose leader's attack attitude is aggressive, once it knows Rocketry, while no person who knows Rocketry is weaker
  than it (OpenCiv2 `city_choose_production_wonder_bias`, `city_production.cpp:1240-1263`). For any other player it
  scores `NEVER_WANTED`, below anything a city would build, which simple-ai-client reads as "not wanted at all"; for
  an aggressive leader it scores twice any other Wonder (`MANHATTAN_PROJECT_BIAS`), as the original ranks it ahead of
  other Wonders for such a leader.
  **Deviation:** the original scores it for any leader, ranking it higher the more militaristic and aggressive the
  leader is; here a leader who isn't aggressive never builds it.

## Not yet (Civ2 M2a deviations and gaps)

- **The Great Wall against barbarians** (their attack halved, and doubled against them): no combat hook.
- **Leonardo's Workshop and a city given in a treaty** (`network_parley`'s city transfer upgrades for the new owner
  too): no city changes hands by treaty yet.
- **The Lighthouse's safe Triremes** are civ2-unit's (its coast-bound odds), not here.
- **Happiness order:** civ2-city-happiness is Civ1-shaped. The Wonders' content comes after martial law (Priority
  4000), and the Hanging Gardens' and Cure for Cancer's happy citizens are city yields, as Civ1's are.
- **Darwin's Voyage's second completion** waits for the player's next choice of research (both do, if they weren't
  researching anything), and is spent at once then. Civ2 completes both at once, picking the next research there and then (`civ_research_complete` calls
  `civ_choose_research`), which a city's production can't do here.
- **Lost Wonders** are remembered through civ2-city-improvement's `Created` rule, which registers every improvement,
  Wonders included, in `cityImprovements`. The civ2 set loads both packages.
- **The Statue of Liberty and an Anarchy already under way:** a revolution's length is fixed when it starts, so a
  Statue completed during Anarchy doesn't shorten it.
- **The computer players' Wonder choice** is Civ1's (`city_choose_production_wonder_bias` isn't ported).
