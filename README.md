# find-extrema [![Build Status](https://travis-ci.com/dbkaplun/find-extrema.svg?branch=master)](https://travis-ci.com/dbkaplun/find-extrema)
Numerically compute the extrema of a given (analytic) function: minima, maxima, and points of inflection

```sh
npm install find-extrema
```

```js
import { findExtremum, rootsNewton } from 'find-extrema';
console.log('minimum of (x - 1)^2:', findExtremum(x => (x - 1) ** 2, 'minimum', {
  findRoot: f => rootsNewton(f, Math.random())
}));
```
