// export const { EPSILON } = Number; // too small
export const EPSILON = 1 / (2 ** 24);

export const itersExceededError = new RangeError('max iterations exceeded');

export interface NumericFunction {
  (x: number): number;
}

export interface DerivativeOptions {
  prec?: number;
}

export function derivative(f: NumericFunction, opts?: DerivativeOptions): NumericFunction {
  const { prec = EPSILON } = opts || {};
  return x => (
    (f(x + prec) - f(x - prec)) / (2 * prec)
  );
}

export interface RootsNewtonOptions {
  prec?: number;
  maxIters?: number;
  derivativeOpts?: DerivativeOptions;
}

export function rootsNewton(f: NumericFunction, guess: number, opts?: RootsNewtonOptions): number {
  const {
    prec = EPSILON,
    maxIters = 20,
    derivativeOpts: derivativeOptsFromArgs = {},
  } = opts || {};
  const derivativeOpts = { prec, ...derivativeOptsFromArgs };

  const df = derivative(f, derivativeOpts);

  let prevGuess;
  let curGuess = guess;
  for (let iter = 0; iter <= maxIters; iter += 1) {
    prevGuess = curGuess;

    const fguess = f(curGuess);
    if (Math.abs(fguess) <= prec) {
      // found a root!
      return curGuess;
    }

    curGuess -= fguess / df(curGuess);
    if (
      Math.abs(curGuess - prevGuess) <= prec
      || Number.isNaN(curGuess)
      || !Number.isFinite(curGuess)
    ) {
      return curGuess;
    }
  }
  throw itersExceededError;
}

export type ExtremumType = 'minimum' | 'maximum' | 'inflection';

export interface GetExtremumTypeOptions {
  prec?: number;
  maxIters?: number;
  nthDerivative?: number;
  derivativeOpts?: DerivativeOptions;
}

// https://en.wikipedia.org/wiki/Derivative_test#Higher-order_derivative_test
// https://en.wikibooks.org/wiki/Calculus/Extrema_and_Points_of_Inflection#The_Extremum_Test
// http://mathworld.wolfram.com/ExtremumTest.html
export function getExtremumType(
  f: NumericFunction,
  x: number,
  opts?: GetExtremumTypeOptions,
): ExtremumType {
  const {
    prec = EPSILON,
    maxIters = 20,
    nthDerivative = 0,
    derivativeOpts: derivativeOptsFromArgs = {},
  } = opts || {};
  const derivativeOpts = { prec, ...derivativeOptsFromArgs };

  let df = f;
  for (let n = 1; n - 1 < maxIters; n += 1) {
    df = derivative(df, derivativeOpts);
    const dfx = df(x);
    if (Math.abs(dfx) > prec) {
      const dn = n + nthDerivative;
      let type: ExtremumType;
      if (dn % 2 === 1) {
        if (dn === 1) throw new Error('not an extremum');
        type = 'inflection';
      } else if (dfx > prec) {
        type = 'minimum';
      } else if (dfx < -prec) {
        type = 'maximum';
      } else {
        /* istanbul ignore next */
        throw new Error('unreachable');
      }

      return type;
    }
  }
  throw itersExceededError;
}

export function divideByRoot(f: NumericFunction, root: number): NumericFunction {
  return x => (f(x) / (x - root));
}

export interface FindExtremumOptions {
  findRoot: (f: NumericFunction) => number;
  prec?: number;
  maxIters?: number;
  derivativeOpts?: DerivativeOptions;
  getExtremumTypeOpts?: GetExtremumTypeOptions;
}

type ExtremumTest = (x: number, type: ExtremumType) => boolean;

export function findExtremum(
  f: NumericFunction,
  type: ExtremumType | ExtremumTest,
  opts: FindExtremumOptions,
): number {
  const isExtremum: ExtremumTest = typeof type === 'function' ? type : (x, t) => t === type;
  const {
    findRoot,
    prec = EPSILON,
    maxIters = 20,
    derivativeOpts: derivativeOptsFromArgs,
    getExtremumTypeOpts: getExtremumTypeOptsFromArgs,
  } = opts;
  const derivativeOpts = { prec, ...derivativeOptsFromArgs };
  const getExtremumTypeOpts = {
    prec,
    maxIters,
    derivativeOpts,
    ...getExtremumTypeOptsFromArgs,
    nthDerivative: 1,
  };

  let df = derivative(f, derivativeOpts);
  for (let iter = 0; iter < maxIters; iter += 1) {
    const x0 = findRoot(df);
    if (
      Number.isNaN(x0)
      || !Number.isFinite(x0)
      || isExtremum(x0, getExtremumType(df, x0, getExtremumTypeOpts))
    ) {
      return x0;
    }

    df = divideByRoot(df, x0);
  }
  throw itersExceededError;
}
