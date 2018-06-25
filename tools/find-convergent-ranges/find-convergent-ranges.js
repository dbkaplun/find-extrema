#!/usr/bin/env node
/* eslint-disable no-console */

const path = require('path');
const rc = require('rc');
const {
  findExtremum,
  itersExceededError,
  rootsNewton,
  EPSILON,
} = require('../..');

if (require.main !== module) throw new Error('must be run as a script');

const {
  f: fStr,
  expected,
  type = 'minimum',
  start = -20,
  end = 20,
  step = 0.01,
  prec = EPSILON,
  findExtremumOpts = {},
  rootsNewtonOpts = {},
} = rc(path.basename(__filename));
const findExtremumOptsForGuess = guess => ({
  findRoot: f => rootsNewton(f, guess, { prec, ...rootsNewtonOpts }),
  prec,
  ...findExtremumOpts,
});

const f = new Function('x', fStr); // eslint-disable-line no-new-func

if (typeof f(0) !== 'number') throw new Error('f must accept x as an argument and return a number');
if (typeof expected !== 'number') throw new Error('expected must be a number');

const ranges = [];
let curRange = null;
for (let guess = start; guess <= end; guess += step * Math.random() * 2) {
  let isValidGuess = false;
  try {
    const actual = findExtremum(f, type, findExtremumOptsForGuess(guess));
    if (Math.abs(actual - expected) <= prec) {
      isValidGuess = true;
      if (!curRange) {
        curRange = { end, start: guess };
        ranges.push(curRange);
      }
    }
  } catch (e) {
    if (e !== itersExceededError) throw e;
  }
  if (!isValidGuess && curRange) {
    curRange.end = guess;
    curRange = null;
  }
}

let totalPercent = 0;
ranges
  .map(range => ({ ...range, pct: (range.end - range.start) / (end - start) }))
  .sort((a, b) => a.pct - b.pct)
  .forEach((range) => {
    totalPercent += range.pct;
    console.log(`  ${(100 * range.pct).toFixed(2)}%: [${range.start.toFixed(5)}, ${range.end.toFixed(5)})`);
  });
console.log(`total correct ranges: ${(100 * totalPercent).toFixed(2)}%`);
