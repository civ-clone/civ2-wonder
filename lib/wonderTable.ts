import {
  AdamSmithsTradingCompany,
  ApolloProgram,
  Colossus,
  CopernicusObservatory,
  CureForCancer,
  DarwinsVoyage,
  EiffelTower,
  GreatLibrary,
  GreatWall,
  HangingGardens,
  HooverDam,
  IsaacNewtonsCollege,
  JsBachsCathedral,
  KingRichardsCrusade,
  LeonardosWorkshop,
  Lighthouse,
  MagellansExpedition,
  ManhattanProject,
  MarcoPolosEmbassy,
  MichelangelosChapel,
  Oracle,
  Pyramids,
  SetiProgram,
  ShakespearesTheatre,
  StatueOfLiberty,
  SunTzusWarAcademy,
  UnitedNations,
  WomensSuffrage,
} from '../Wonders';
import { NONE, WonderRow, wonders } from '../data/wonders';
import Advance from '@civ-clone/core-science/Advance';
import Wonder from '@civ-clone/core-wonder/Wonder';
import { advanceAt } from '@civ-clone/civ2-science/lib/advanceIndex';

/**
 * The Wonders in RULES.TXT's order (`data/wonders`' rows; OpenCiv2's `WONDER_*` indices), which is also the order of
 *  the Wonders of the World report.
 */
export const wonderTypes: (typeof Wonder)[] = [
  Pyramids,
  HangingGardens,
  Colossus,
  Lighthouse,
  GreatLibrary,
  Oracle,
  GreatWall,
  SunTzusWarAcademy,
  KingRichardsCrusade,
  MarcoPolosEmbassy,
  MichelangelosChapel,
  CopernicusObservatory,
  MagellansExpedition,
  ShakespearesTheatre,
  LeonardosWorkshop,
  JsBachsCathedral,
  IsaacNewtonsCollege,
  AdamSmithsTradingCompany,
  DarwinsVoyage,
  StatueOfLiberty,
  EiffelTower,
  WomensSuffrage,
  HooverDam,
  ManhattanProject,
  UnitedNations,
  ApolloProgram,
  SetiProgram,
  CureForCancer,
];

/** The advance at a @CIVILIZE index, or `null` for `nil`. */
export const advanceType = (index: number): typeof Advance | null =>
  index === NONE ? null : advanceAt(index);

/** Each Wonder with its row. */
export const wonderRows: [typeof Wonder, WonderRow][] = wonderTypes.map(
  (WonderType: typeof Wonder, index: number): [typeof Wonder, WonderRow] => [
    WonderType,
    wonders[index],
  ]
);

export default wonderTypes;
