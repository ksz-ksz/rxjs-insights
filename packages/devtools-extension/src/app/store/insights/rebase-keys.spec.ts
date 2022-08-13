import { rebaseKeys } from './rebase-keys';

describe('rebaseKeys', () => {
  // 18 -\
  //       - 15 - 14 -<13>- 9 - 25
  // 25 -/
  const keyMapping = {
    '13': 0,
    '13.9': 1,
    '13.9.25': 2,
    '13.14': 3,
    '13.14.15': 4,
    '13.14.15.18': 5,
    '13.14.15.25': 6,
  };

  const toKey = '13.14.15';

  // 18 -\
  //       -<15>- 14 - 13 - 9 - 25
  // 25 -/
  const expectedKeyMapping = {
    '15.14.13': 0,
    '15.14.13.9': 1,
    '15.14.13.9.25': 2,
    '15.14': 3,
    '15': 4,
    '15.18': 5,
    '15.25': 6,
  };

  it('should work', () => {
    // when
    const rebasedKeyMapping = rebaseKeys(keyMapping, toKey);

    // then
    expect(rebasedKeyMapping).toEqual(expectedKeyMapping);
  });
});
