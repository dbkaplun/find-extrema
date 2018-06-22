import util from 'util';

// @ts-ignore Cannot find module 'expect/build/matchers'.
import matchers from 'expect/build/matchers';
// @ts-ignore Cannot find module 'expect/build/to_throw_matchers'.
import to_throw_matchers from 'expect/build/to_throw_matchers';

export interface NumericTest {
  expectedErr?: any;
  expected?: number;
  expectedIsInfinite?: boolean;
}

expect.extend({ toPassNumericTest });
declare global {
  namespace jest {
    interface Matchers<R> {
      // FIXME: hack
      // toPassNumericTest: typeof toPassNumericTest;
      toPassNumericTest: (test: NumericTest) => R;
    }
  }
}

function toPassNumericTest<R>(
  this: jest.MatcherUtils,
  getActual: () => number,
  test: NumericTest,
): R {
  let ret;
  if ('expectedErr' in test) {
    ret = to_throw_matchers.toThrowError(getActual, test.expectedErr);
  } else {
    const actual = getActual();
    if (typeof test.expected === 'number') {
      ret = Number.isFinite(test.expected) && !Number.isNaN(test.expected)
        ? matchers.toBeCloseTo(actual, test.expected)
        : matchers.toBe(actual, test.expected);
    } else if (typeof test.expectedIsInfinite === 'boolean') {
      ret = matchers.toBe(Number.isFinite(actual), !test.expectedIsInfinite);
    }
  }

  const origMsg = ret.message();
  const testMsg = util.inspect(test, { colors: true });
  ret.message = () => `${origMsg}\nTest: ${testMsg}`;
  return ret;
}
