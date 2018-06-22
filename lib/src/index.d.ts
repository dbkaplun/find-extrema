export declare const EPSILON: number;
export declare const itersExceededError: RangeError;
export interface NumericFunction {
    (x: number): number;
}
export interface DerivativeOptions {
    prec?: number;
}
export declare function derivative(f: NumericFunction, opts?: DerivativeOptions): NumericFunction;
export interface RootsNewtonOptions {
    prec?: number;
    maxIters?: number;
    derivativeOpts?: DerivativeOptions;
}
export declare function rootsNewton(f: NumericFunction, guess: number, opts?: RootsNewtonOptions): number;
export declare type ExtremumType = 'minimum' | 'maximum' | 'inflection';
export interface GetExtremumTypeOptions {
    prec?: number;
    maxIters?: number;
    nthDerivative?: number;
    derivativeOpts?: DerivativeOptions;
}
export declare function getExtremumType(f: NumericFunction, x: number, opts?: GetExtremumTypeOptions): ExtremumType;
export declare function divideByRoot(f: NumericFunction, root: number): NumericFunction;
export interface FindExtremumOptions {
    findRoot: (f: NumericFunction) => number;
    prec?: number;
    maxIters?: number;
    derivativeOpts?: DerivativeOptions;
    getExtremumTypeOpts?: GetExtremumTypeOptions;
}
declare type ExtremumTest = (x: number, type: ExtremumType) => boolean;
export declare function findExtremum(f: NumericFunction, type: ExtremumType | ExtremumTest, opts: FindExtremumOptions): number;
export {};
