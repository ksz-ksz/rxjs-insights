import { hash } from './hash';

interface TestCase {
  a: any;
  b: any;
}

const same: TestCase[] = [
  { a: 0, b: 0 },
  { a: 'str', b: 'str' },
  { a: true, b: true },
  { a: {}, b: {} },
  { a: { p: 'a' }, b: { p: 'a' } },
  { a: { p: 'a', r: 'b' }, b: { r: 'b', p: 'a' } },
  { a: { p: 'a', r: 'b', s: null }, b: { r: 'b', p: 'a', s: null } },
  {
    a: { p: 'a', r: 'b', s: null, t: undefined },
    b: { q: undefined, r: 'b', p: 'a', s: null },
  },
  { a: [], b: [] },
  { a: [0, 'str', true, {}], b: [0, 'str', true, {}] },
];

const different: TestCase[] = [
  { a: 0, b: 1 },
  { a: 'str', b: 'ing' },
  { a: true, b: false },
  { a: {}, b: { a: true } },
  { a: {}, b: { a: null } },
  { a: { a: null }, b: { a: null, b: 1 } },
  { a: [], b: [1] },
  { a: ['str', 0, true, {}], b: [0, 'str', true, {}] },
];

describe('hash', () => {
  same.forEach(({ a, b }) => {
    it(`should be same
    ${a}
    ${b}
    `, () => {
      expect(hash(a)).toEqual(hash(b));
    });
  });
  different.forEach(({ a, b }) => {
    it(`should be different
    ${a}
    ${b}
    `, () => {
      expect(hash(a)).not.toEqual(hash(b));
    });
  });
});
