import { MpZ } from '..';
import { assertSame } from './assertions';

describe('log2', () => {
  it('return correct results', () => {
    assertSame(MpZ.from(1).log2(), 0);
    assertSame(MpZ.from(2).log2(), 1);
    assertSame(MpZ.from(3).log2(), 1);

    assertSame(MpZ.from(2 ** 10).log2(), 10);
    assertSame(MpZ.from(10).pow(10).log2(), 33);
  });
});

describe('log10', () => {
  it('return correct results', () => {
    assertSame(MpZ.from(1).log10(), 0);
    assertSame(MpZ.from(2).log10(), 0);
    assertSame(MpZ.from(9).log10(), 0);

    assertSame(MpZ.from(10).log10(), 1);
    assertSame(MpZ.from(20).log10(), 1);
    assertSame(MpZ.from(99).log10(), 1);

    assertSame(MpZ.from(100).log10(), 2);

    assertSame(MpZ.from(10).pow(10).log10(), 10);
  });
});
