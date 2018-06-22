import { Foo, foo } from '../src/index';

describe('index', () => {
  it('should work', () => {
    expect(foo).toBeInstanceOf(Foo);
  });
});
