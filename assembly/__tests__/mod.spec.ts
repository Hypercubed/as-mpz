import { MpZ } from '..';
import { assertSame } from './assertions';

describe('rem', () => {
  it('return correct results', () => {
    assertSame(MpZ.from(0).rem(1), 0);
    assertSame(MpZ.from(1).rem(1), 0);
    assertSame(MpZ.from(0xdeadbeef).rem(1), 0);
    assertSame(MpZ.from('0xDEADBEEFDEADBEEFDEADBEEF').rem(1), 0);

    assertSame(MpZ.from(2).rem(2), 0);
    assertSame(MpZ.from(3).rem(2), 1);

    assertSame(MpZ.from(0xdeadbeef).rem(2), 1);
    assertSame(MpZ.from(0xfffffffe).rem(0xf), 0xe);
    assertSame(MpZ.from('0xDEADBEEFDEADBEEFDEADBEEF').rem(2), 1);
    assertSame(MpZ.from('0xFFFFFFFFFFFFFFFFFFFFFFFE').rem(0xf), 0xe);

    assertSame(MpZ.from(123456789).rem(100), 89);
    assertSame(MpZ.from(123456789).rem(1000), 789);

    assertSame(MpZ.from(100007).rem(100000), 7);

    assertSame(MpZ.from(100000).rem(7), 5);
    assertSame(MpZ.from(-100000).rem(7), -5);
    assertSame(MpZ.from(-100000).rem(-7), -5);
    assertSame(MpZ.from(100000).rem(-7), 5);
  });

  it('large m', () => {
    const l = MpZ.from('542101086242752217003726400434970855712890625');

    assertSame(l.mod(MpZ.from('10000000000000')), '855712890625');
    assertSame(l.mod(MpZ.from('100000000000000000000')), '434970855712890625');
    assertSame(
      l.rem(MpZ.from('1000000000000000000000000000000000000000000000')),
      '542101086242752217003726400434970855712890625'
    );
  });

  it('throws on rem by zero', () => {
    expect(() => {
      MpZ.from(1).rem(0);
    }).toThrow();
  });
});

describe('mod', () => {
  it('return correct results', () => {
    assertSame(MpZ.from(0).mod(1), 0);
    assertSame(MpZ.from(100000 + 7).mod(100000), 7);

    assertSame(MpZ.from(100000).mod(7), 5);
    assertSame(MpZ.from(-100000).mod(7), 2);
    assertSame(MpZ.from(-100000).mod(-7), -5);
    assertSame(MpZ.from(100000).mod(-7), -2);

    assertSame(MpZ.from(10000).mod(7), 4);
    assertSame(MpZ.from(-10000).mod(7), 3);
    assertSame(MpZ.from(-10000).mod(-7), -4);
    assertSame(MpZ.from(10000).mod(-7), -3);
  });

  it('throws on mod by zero', () => {
    expect(() => {
      MpZ.from(1).mod(0);
    }).toThrow();
  });
});

describe('operators', () => {
  it('supports operators', () => {
    assertSame(MpZ.from(5) % MpZ.from(3), 2);

    let x = MpZ.from(5);
    assertSame(x, 5);
    x %= MpZ.from(3);
    assertSame(x, 2);
  });
});
