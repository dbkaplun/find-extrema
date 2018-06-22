"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.derivative = derivative;
exports.rootsNewton = rootsNewton;
exports.getExtremumType = getExtremumType;
exports.divideByRoot = divideByRoot;
exports.findExtremum = findExtremum;
exports.itersExceededError = exports.EPSILON = void 0;

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// export const { EPSILON } = Number; // too small
var EPSILON = 1 / Math.pow(2, 24);
exports.EPSILON = EPSILON;
var itersExceededError = new RangeError('max iterations exceeded');
exports.itersExceededError = itersExceededError;

function derivative(f, opts) {
  var _ref = opts || {},
      _ref$prec = _ref.prec,
      prec = _ref$prec === void 0 ? EPSILON : _ref$prec;

  return function (x) {
    return (f(x + prec) - f(x - prec)) / (2 * prec);
  };
}

function rootsNewton(f, guess, opts) {
  var _ref2 = opts || {},
      _ref2$prec = _ref2.prec,
      prec = _ref2$prec === void 0 ? EPSILON : _ref2$prec,
      _ref2$maxIters = _ref2.maxIters,
      maxIters = _ref2$maxIters === void 0 ? 20 : _ref2$maxIters,
      _ref2$derivativeOpts = _ref2.derivativeOpts,
      derivativeOptsFromArgs = _ref2$derivativeOpts === void 0 ? {} : _ref2$derivativeOpts;

  var derivativeOpts = _objectSpread({
    prec: prec
  }, derivativeOptsFromArgs);

  var df = derivative(f, derivativeOpts);
  var prevGuess;
  var curGuess = guess;

  for (var iter = 0; iter <= maxIters; iter += 1) {
    prevGuess = curGuess;
    var fguess = f(curGuess);

    if (Math.abs(fguess) <= prec) {
      // found a root!
      return curGuess;
    }

    curGuess -= fguess / df(curGuess);

    if (Math.abs(curGuess - prevGuess) <= prec || Number.isNaN(curGuess) || !Number.isFinite(curGuess)) {
      return curGuess;
    }
  }

  throw itersExceededError;
}

// https://en.wikipedia.org/wiki/Derivative_test#Higher-order_derivative_test
// https://en.wikibooks.org/wiki/Calculus/Extrema_and_Points_of_Inflection#The_Extremum_Test
// http://mathworld.wolfram.com/ExtremumTest.html
function getExtremumType(f, x, opts) {
  var _ref3 = opts || {},
      _ref3$prec = _ref3.prec,
      prec = _ref3$prec === void 0 ? EPSILON : _ref3$prec,
      _ref3$maxIters = _ref3.maxIters,
      maxIters = _ref3$maxIters === void 0 ? 20 : _ref3$maxIters,
      _ref3$nthDerivative = _ref3.nthDerivative,
      nthDerivative = _ref3$nthDerivative === void 0 ? 0 : _ref3$nthDerivative,
      _ref3$derivativeOpts = _ref3.derivativeOpts,
      derivativeOptsFromArgs = _ref3$derivativeOpts === void 0 ? {} : _ref3$derivativeOpts;

  var derivativeOpts = _objectSpread({
    prec: prec
  }, derivativeOptsFromArgs);

  var df = f;

  for (var n = 1; n - 1 < maxIters; n += 1) {
    df = derivative(df, derivativeOpts);
    var dfx = df(x);

    if (Math.abs(dfx) > prec) {
      var dn = n + nthDerivative;
      var type = void 0;

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

function divideByRoot(f, root) {
  return function (x) {
    return f(x) / (x - root);
  };
}

function findExtremum(f, type, opts) {
  var isExtremum = typeof type === 'function' ? type : function (x, t) {
    return t === type;
  };
  var findRoot = opts.findRoot,
      _opts$prec = opts.prec,
      prec = _opts$prec === void 0 ? EPSILON : _opts$prec,
      _opts$maxIters = opts.maxIters,
      maxIters = _opts$maxIters === void 0 ? 20 : _opts$maxIters,
      derivativeOptsFromArgs = opts.derivativeOpts,
      getExtremumTypeOptsFromArgs = opts.getExtremumTypeOpts;

  var derivativeOpts = _objectSpread({
    prec: prec
  }, derivativeOptsFromArgs);

  var getExtremumTypeOpts = _objectSpread({
    prec: prec,
    maxIters: maxIters,
    derivativeOpts: derivativeOpts
  }, getExtremumTypeOptsFromArgs, {
    nthDerivative: 1
  });

  var df = derivative(f, derivativeOpts);

  for (var iter = 0; iter < maxIters; iter += 1) {
    var x0 = findRoot(df);

    if (Number.isNaN(x0) || !Number.isFinite(x0) || isExtremum(x0, getExtremumType(df, x0, getExtremumTypeOpts))) {
      return x0;
    }

    df = divideByRoot(df, x0);
  }

  throw itersExceededError;
}