import { MpZ } from '..';
import { assertSame } from './assertions';

describe('addition', () => {
  it('positive values, Size(rhs, lhs) === 1', () => {
    assertSame(MpZ.from(0x0).add(0x0), 0);
    assertSame(MpZ.from(0x0).add(0x1), 1);
    assertSame(MpZ.from(0x1).add(0x0), 1);
    assertSame(MpZ.from(0x3).add(0x5), 8);
    assertSame(MpZ.from(0x5).add(0x3), 8);
    assertSame(MpZ.from(0xdead0000).add(0x0000beef), 0xdeadbeef);
    assertSame(MpZ.from(0xbe00).add(0x00ef), 0xbeef);
    assertSame(MpZ.from(0xffffffff).add(0xffffffff), 0x1fffffffe);
  });

  it('rhs < 0, Size(rhs) === 1', () => {
    assertSame(MpZ.from(0x3).add(-0x5), -2);
    assertSame(MpZ.from(0x5).add(-0x3), 2);
    assertSame(MpZ.from(0xdeadbeef).add(-0x0000beef), 0xdead0000);
  });

  it('lhs< 0, rhs < 0, Size(rhs) === 1', () => {
    assertSame(MpZ.from(-0x3).add(-0x5), -8);
    assertSame(MpZ.from(-0x5).add(-0x3), -8);
    assertSame(MpZ.from(-0xdead0000).add(-0x0000beef), -0xdeadbeef);
  });

  it('positive values, Size(rhs) === 2', () => {
    assertSame(
      MpZ.from(u64(0xdeadbeef00000000)).add(0x00000000ffffffff as u64),
      u64(0xdeadbeefffffffff)
    );
    assertSame(
      MpZ.from(0xdead0000ffffffff as u64).add(0x0000beefffffffff as u64),
      u64(0xdeadbef0fffffffe)
    );
  });
});

describe('subtraction', () => {
  it('positive values, Size(rhs, lhs) === 1', () => {
    assertSame(MpZ.from(0x0).sub(0x0), 0x0);
    assertSame(MpZ.from(0xffff).sub(0x00ff), 0xff00);
    assertSame(MpZ.from(0xffffffff).sub(0x0000ffff), 0xffff0000);
    assertSame(MpZ.from(0xffffff).sub(0x00ffff), 0xff0000);
    assertSame(MpZ.from(<u64>0xffff_ffff_ffff).sub(0xff), 0xffffffffff00);
    assertSame(MpZ.from(<u64>0xffff_ffff_ffff).sub(0xffff), 0xffffffff0000);
    assertSame(
      MpZ.from(<u64>0xffff_ffff_ffff_ffff) -
        MpZ.from(0xf0f0_f0f0_f0f0_f0f0 as u64),
      0xf0f0f0f0f0f0f0f
    );
    assertSame(
      MpZ.from(<u64>0x9999_8888_7777_6666) -
        MpZ.from(0x6666_7777_8888_9999 as u64),
      0x33331110eeeecccd
    );
    assertSame(
      MpZ.from(<u64>0xfedcba987654321).sub(0x123456789abcdef as u64),
      0xeca8641fdb97532
    );

    assertSame(
      MpZ.from('36893488147419103232').sub('18446744071076859612'),
      '18446744076342243620'
    );
  });

  it('rhs < 0, Size(rhs) === 1', () => {
    assertSame(MpZ.from(0x3).sub(-0x5), 8);
    assertSame(MpZ.from(0x5).sub(-0x3), 8);
    assertSame(MpZ.from(0xdead0000).sub(-0x0000beef), 0xdeadbeef);
  });

  it('lhs< 0, rhs < 0, Size(rhs) === 1', () => {
    assertSame(MpZ.from(-0x3).sub(-0x5), 2);
    assertSame(MpZ.from(-0x5).sub(-0x3), -2);
    assertSame(MpZ.from(-0xdeadbeef).sub(-0x0000beef), -0xdead0000);
  });
});

describe('operators', () => {
  it('supports operators', () => {
    assertSame(MpZ.from(0x5) + MpZ.from(0x3), 8);
    assertSame(MpZ.from(0x5) - MpZ.from(0x3), 2);

    let x = MpZ.from(5);
    assertSame(x, 5);
    x += MpZ.ONE;
    assertSame(x, 6);
    assertSame(x++, 6);
    assertSame(x, 7);
    assertSame(++x, 8);
    assertSame(x, 8);

    assertSame(x--, 8);
    assertSame(x, 7);
    assertSame(--x, 6);
    assertSame(x, 6);
    x -= MpZ.ONE;
    assertSame(x, 5);
  });

  it('operators on negative values', () => {
    assertSame(MpZ.from(-0x5) + MpZ.from(-0x3), -8);
    assertSame(MpZ.from(-0x5) - MpZ.from(-0x3), -2);

    let x = MpZ.from(-5);
    assertSame(x, -5);
    x += MpZ.from(-1);
    assertSame(x, -6);
    assertSame(x++, -6);
    assertSame(x, -5);
    assertSame(++x, -4);
    assertSame(x, -4);

    assertSame(x--, -4);
    assertSame(x, -5);
    assertSame(--x, -6);
    assertSame(x, -6);
    x -= MpZ.from(-1);
    assertSame(x, -5);
  });

  it('operators on zero', () => {
    let x = MpZ.from(0);
    assertSame(++x, 1);
    assertSame(--x, 0);
    expect(x.eqz()).toBe(true);
    assertSame(--x, -1);
    x++;
    expect(x.eqz()).toBe(true);
  });
});
