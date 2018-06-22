export interface NumericTest {
    expectedErr?: any;
    expected?: number;
    expectedIsInfinite?: boolean;
}
declare global {
    namespace jest {
        interface Matchers<R> {
            toPassNumericTest: (test: NumericTest) => R;
        }
    }
}
