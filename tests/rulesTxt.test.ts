// Checks `data/wonders` against the player's own RULES.TXT, which is never committed. Skipped unless `CIV2_PATH` names
//  the folder it's in: `CIV2_PATH=~/Code/civ-clone/civ2 npm test`. Only numbers are compared; nothing from the file is
//  printed but a row number.
import {
  AdvanceRecord,
  EndWonderRecord,
  ImprovementRecord,
  improvementCount,
  readCivilize,
  readEndWonder,
  readImprovements,
  wonderCount,
} from '@civ-clone/civ2-asset-extractor/rules';
import { NONE, wonders } from '../data/wonders';
import { existsSync, readFileSync } from 'fs';
import { expect } from 'chai';
import { join } from 'path';

const path = process.env.CIV2_PATH
  ? join(process.env.CIV2_PATH, 'RULES.TXT')
  : null;

(path && existsSync(path) ? describe : describe.skip)(
  'RULES.TXT @IMPROVE and @ENDWONDER',
  (): void => {
    const rules = path ? readFileSync(path, 'latin1') : '',
      improvements: ImprovementRecord[] = path ? readImprovements(rules) : [],
      endWonder: EndWonderRecord[] = path ? readEndWonder(rules) : [],
      advances: AdvanceRecord[] = path ? readCivilize(rules) : [],
      // An advance reference is its abbreviation, the first word of its @CIVILIZE row's comment.
      advanceIndex = (token: string): number => {
        if (token === 'nil') {
          return NONE;
        }

        const index = advances.findIndex(
          ({ comment }) => (comment ?? '').split(/\s+/)[0] === token
        );

        expect(index >= 0, 'an advance reference resolves').to.true;

        return index;
      };

    it('has 28 Wonder rows after the improvements', (): void => {
      expect(improvements.length).to.equal(improvementCount + wonderCount);
      expect(endWonder.length).to.equal(wonderCount);
      expect(wonders.length).to.equal(wonderCount);
    });

    it('matches the cost, upkeep and prerequisite of @IMPROVE rows 39 to 66', (): void => {
      improvements.slice(improvementCount).forEach((record, index) => {
        const [cost, prerequisite] = wonders[index],
          matches =
            record.cost === cost &&
            record.upkeep === 0 &&
            advanceIndex(record.prerequisite) === prerequisite;

        expect(matches, `row ${improvementCount + index}`).to.true;
      });
    });

    it('matches every @ENDWONDER row', (): void => {
      endWonder.forEach((record, index) => {
        expect(
          advanceIndex(record.expiresWith) === wonders[index][2],
          `row ${index}`
        ).to.true;
      });
    });
  }
);
