import { NumericTest } from './setup';

import {
  EPSILON,
  DerivativeOptions,
  ExtremumType,
  FindExtremumOptions,
  NumericFunction,
  RootsNewtonOptions,
  derivative,
  findExtremum,
  itersExceededError,
  rootsNewton,
} from '../src/index';

const randRange = (start = -20, end = 20) => Math.random() * (end - start) + start;

describe('EPSILON', () => {
  it('should be really small', () => {
    expect(EPSILON).toBeGreaterThan(0);
    expect(EPSILON).toBeLessThan(0.0001);
  });
});

describe('itersExceededError', () => {
  it('should match snapshot', () => {
    expect(itersExceededError).toMatchSnapshot();
  });
});

describe('derivative', () => {
  const tests: {
    name: string,
    $f: NumericFunction,
    $df: NumericFunction,
    opts?: DerivativeOptions,
  }[] = [
    { name: '5',        $f: x => 5,             $df: x => 0 },
    { name: '5x',       $f: x => 5 * x,         $df: x => 5 },
    { name: 'x^3 + 1',  $f: x => (x ** 3) + 1,  $df: x => 3 * (x ** 2) },
    { name: 'sin(x)',   $f: Math.sin,           $df: Math.cos },
  ];
  tests.forEach(({ name, $f, $df, opts }) => {
    it(`should produce correct results: ${name}`, () => {
      const df = derivative($f, opts);
      for (let i = 0; i < 20; i += 1) {
        const rand = randRange();
        expect(df(rand)).toBeCloseTo($df(rand));
      }
    });
  });
});

describe('rootsNewton', () => {
  const tests: (NumericTest & {
    name: string,
    $f: NumericFunction,
    guess: number,
    opts?: RootsNewtonOptions,
  })[] = [
    { name: 'x - 1000',    $f: x => x - 1000,         guess: randRange(),       expected: 1000 },
    { name: 'x^3 + 4096',  $f: x => (x ** 3) + 4096,  guess: randRange(),       expected: -16 },
    { name: 'x^2',         $f: x => x ** 2,           guess: randRange(-1, 1),  expected: 0 },

    { name: 'NaN',         $f: x => NaN,              guess: randRange(),       expected: NaN },
    {
      name: 'x^2 + 1',
      $f: x => (x ** 2) + 1,
      guess: randRange(),
      expectedErr: itersExceededError,
    },
  ];
  tests.forEach((test) => {
    const { name, $f, guess, opts } = test;
    it(`should produce correct results: ${name}`, () => {
      expect(() => rootsNewton($f, guess, opts)).toPassNumericTest(test);
    });
  });
});

describe('findExtremum', () => {
  const getOptsForGuess = (guess: number) => ({
    findRoot: (f: NumericFunction) => rootsNewton(f, guess),
  });

  const tests: (NumericTest & {
    name: string,
    $f: NumericFunction,
    type: ExtremumType,
    opts: FindExtremumOptions,
  })[] = [
    {
      name: '-(x - 1)^2',
      $f: x => -((x - 1) ** 2),
      type: 'maximum',
      opts: getOptsForGuess(randRange(-6, 6)),
      expected: 1,
    },
    {
      name: '(x + 1)^2 + 1',
      $f: x => ((x + 1) ** 2) + 1,
      type: 'minimum',
      opts: getOptsForGuess(randRange(-8, 7)),
      expected: -1,
    },
    {
      name: 'x^2(x - 1)(x + 1)',
      $f: x => (x ** 2) * (x - 1) * (x + 1), // one local maximum and two local minima (1/√2, -1/√2)
      type: 'maximum',
      opts: getOptsForGuess(randRange(-0.3, 0.3)),
      expected: 0,
    },
    {
      name: '(x - 20)^3 + 20',
      $f: x => (x - 20) ** 3 + 20,
      type: 'inflection',
      opts: { ...getOptsForGuess(20), prec: EPSILON * (2 ** 4) }, // FIXME: numerically unstable
      expected: 20,
    },
    {
      name: 'cos(x)',
      $f: x => Math.cos(x),
      type: 'maximum',
      opts: getOptsForGuess(randRange(-Math.PI / 3, Math.PI / 3)),
      expected: 0,
    },

    {
      name: '0',
      $f: x => 0,
      type: 'minimum',
      opts: getOptsForGuess(randRange()),
      expectedErr: itersExceededError,
    },
    {
      name: 'random',
      $f: x => Math.random(),
      type: 'inflection',
      opts: getOptsForGuess(randRange()),
      expectedErr: itersExceededError,
    },
    {
      name: 'NaN',
      $f: x => NaN,
      type: 'minimum',
      opts: getOptsForGuess(randRange()),
      expected: NaN,
    },
    {
      name: 'x - 1000',
      $f: x => x - 1000,
      type: 'minimum',
      opts: getOptsForGuess(randRange()),
      expectedIsInfinite: true,
    },
    {
      name: 'x',
      $f: x => x,
      type: 'maximum',
      opts: getOptsForGuess(randRange()),
      expectedIsInfinite: true,
    },
    {
      name: 'x + 1000',
      $f: x => x + 1000,
      type: 'inflection',
      opts: getOptsForGuess(randRange()),
      expectedIsInfinite: true,
    },
  ];
  tests.forEach((test) => {
    const { name, $f, type, opts } = test;
    it(`should produce correct results: ${name}`, () => {
      expect(() => findExtremum($f, type, opts)).toPassNumericTest(test);
    });
  });
});
