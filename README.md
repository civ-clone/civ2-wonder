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
  - The computer players want one as `civ1-wonder`'s do.
- **Expiry** (@ENDWONDER): a Wonder stops working once *anyone* has the advance, and is announced obsolete then.
- **Effects** whose shape the base rules have:
  - **Colossus:** +1 trade on each worked square with trade, in its city.
  - **King Richard's Crusade:** +1 shield on each worked square, in its city.
  - **Hanging Gardens:** 1 happy citizen in each of its owner's cities, 3 in its own.
  - **Cure for Cancer:** 1 happy citizen in each of its owner's cities.
  - **Shakespeare's Theatre:** no unhappy citizens in its city.
  - **J. S. Bach's Cathedral:** 2 fewer unhappy in each of its owner's cities.
  - **Isaac Newton's College:** doubles its city's science buildings' bonus.
  - **Copernicus Observatory:** doubles its city's science, after the rest.
  - **Lighthouse:** +1 move for ships that aren't coast-bound.
  - **Magellan's Expedition:** +2 moves for ships.
  - **Great Library:** an advance known by 2 civilizations, barbarians not counted.
  - **Darwin's Voyage:** two research completions.
  - **Statue of Liberty:** any government, and Anarchy ends next turn.
- **Not here, by design:** a Wonder that acts as an improvement in every city is tested with it, at the improvement's
  site (base-wonder's `hasImprovementOrWonder`, in civ2-city-improvement and civ2-unit). That covers Pyramids/Granary,
  Michelangelo's/Cathedral, Women's Suffrage/Police Station, Great Wall/City Walls, SETI/Research Lab, Hoover
  Dam/Hydro Plant, Sun Tzu's/Barracks, Lighthouse/Port Facility, and the Oracle's Temple. civ2-unit reads the
  Manhattan Project for nuclear weapons.

## Not yet (Civ2 M2a deviations and gaps)

- **Marco Polo's Embassy** (an embassy with every civilization), **Leonardo's Workshop** (an upgrade a turn),
  **Adam Smith's Trading Co.** (pays upkeep-1 improvements), **the Eiffel Tower** (reputation and the AI's attitude),
  **the United Nations** and **the Great Wall's diplomacy**: no shape for them yet.
- **The Great Wall against barbarians** (their attack halved, and doubled against them): no combat hook.
- **The Manhattan Project's reputation cut**, **the Apollo Program's revealed map and cities**, and **Sun Tzu's
  veterans after a win**: no shape yet.
- **The Lighthouse's safe Triremes:** no shape yet.
- **Happiness order:** civ2-city-happiness is Civ1-shaped. The Wonders' content comes after martial law (Priority
  4000), and the Hanging Gardens' and Cure for Cancer's happy citizens are city yields, as Civ1's are.
- **Newton's rounding:** the share is `base × buildings − ⌊base × buildings / 2⌋`. It's exact only if
  civ2-city-improvement adds the buildings' bonus as one sum, as Civ2 does, not as a separate half for each.
- **The Statue of Liberty and an Anarchy already under way:** a revolution's length is fixed when it starts, so a
  Statue completed during Anarchy doesn't shorten it.
- **The computer players' Wonder choice** is Civ1's (`city_choose_production_wonder_bias` isn't ported).
