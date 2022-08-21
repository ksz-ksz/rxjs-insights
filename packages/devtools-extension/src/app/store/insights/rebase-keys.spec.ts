import { rebaseKeys } from './rebase-keys';

// 18 -\
//       - 15 - 14 -<13>- 9 - 25
// 25 -/
const keyMappingA = {
  '18.15.14.<13>': 5,
  '25.15.14.<13>': 6,
  '15.14.<13>': 4,
  '14.<13>': 3,
  '<13>': 0,
  '<13>.9': 1,
  '<13>.9.25': 2,
};

// 18 -\
//       -<15>- 14 - 13 - 9 - 25
// 25 -/
const keyMappingB = {
  '18.<15>': 5,
  '25.<15>': 6,
  '<15>': 4,
  '<15>.14': 3,
  '<15>.14.13': 0,
  '<15>.14.13.9': 1,
  '<15>.14.13.9.25': 2,
};

describe('rebaseKeys', () => {
  it('should rebase to destination key', () => {
    // given
    const toKey = '15.14.<13>';

    // when
    const rebasedKeyMapping = rebaseKeys(keyMappingA, toKey);

    // then
    expect(rebasedKeyMapping).toEqual(keyMappingB);
  });

  it('should rebase to source key', () => {
    // given
    const toKey = '<15>.14.13';

    // when
    const rebasedKeyMapping = rebaseKeys(keyMappingB, toKey);

    // then
    expect(rebasedKeyMapping).toEqual(keyMappingA);
  });
});
