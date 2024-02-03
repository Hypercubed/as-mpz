import { MpZ } from '..';
import { assertSame } from './assertions';

describe('AND', () => {
  it('return correct results', () => {
    assertSame(MpZ.from(0x0).and(0x0), 0);
    assertSame(MpZ.from(0x1).and(0x1), 1);
    assertSame(MpZ.from(0x10).and(0x10), 0x10);
    assertSame(MpZ.from(0xf0ff).and(0xff0f), 0xf00f);
    assertSame(MpZ.from(0xf0ffffff).and(0xffffff0f), 0xf0ffff0f);
  });
});

describe('OR', () => {
  it('return correct results', () => {
    assertSame(MpZ.from(0x0).or(0x0), 0);
    assertSame(MpZ.from(0x1).or(0x1), 1);
    assertSame(MpZ.from(0x10).or(0x10), 0x10);
    assertSame(MpZ.from(0xf0ff).or(0xff0f), 0xffff);
    assertSame(MpZ.from(0xf0ffffff).or(0xffffff0f), 0xffffffff);
  });
});

describe('XOR', () => {
  it('return correct results', () => {
    assertSame(MpZ.from(0x0).xor(0x0), 0);
    assertSame(MpZ.from(0x1).xor(0x1), 0);
    assertSame(MpZ.from(0x10).xor(0x10), 0);
    assertSame(MpZ.from(0xf0ff).xor(0xff0f), 0x0ff0);
    assertSame(MpZ.from(0xf0ffffff).xor(0xffffff0f), 0x0f0000f0);
  });
});

describe('getBit', () => {
  it('return correct results', () => {
    const getBit = (n: i64, i: u32): bool => {
      return (n & (1 << i)) !== 0;
    };

    for (let n: i64 = -i64(2 ** 11); n < i64(2 ** 11); n++) {
      for (let i: u32 = 0; n < 30; n++) {
        // @ts-ignore
        assertSame(MpZ.from(n)._getBit(i), getBit(n, i), `n: ${n}, i: ${i}`);
      }
    }

    // @ts-ignore
    assertSame(MpZ.from('0b00')._getBit(0), false);
    // @ts-ignore
    assertSame(MpZ.from('0b01')._getBit(0), true);
    // @ts-ignore
    assertSame(MpZ.from('-0b01')._getBit(0), true); // -0b01 = 0b11111111
    // @ts-ignore
    assertSame(MpZ.from('0b10')._getBit(0), false);
    // @ts-ignore
    assertSame(MpZ.from('-0b10')._getBit(0), false); // -0b10 = 0b11111110

    // @ts-ignore
    assertSame(MpZ.from('0b00')._getBit(1), false);
    // @ts-ignore
    assertSame(MpZ.from('0b01')._getBit(1), false);
    // @ts-ignore
    assertSame(MpZ.from('-0b01')._getBit(1), true); // -0b01 = 0b11111111
    // @ts-ignore
    assertSame(MpZ.from('0b10')._getBit(1), true);
    // @ts-ignore
    assertSame(MpZ.from('-0b10')._getBit(1), true); // -0b10 = 0b11111110
  });
});

describe('operators', () => {
  it('return correct results', () => {
    assertSame(MpZ.from(0xf0ff) & MpZ.from(0xff0f), 0xf00f);
    assertSame(MpZ.from(0xf0ff) | MpZ.from(0xff0f), 0xffff);
    assertSame(MpZ.from(0xf0ff) ^ MpZ.from(0xff0f), 0x0ff0);
  });
});
