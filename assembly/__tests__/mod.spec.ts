import { MpZ } from '..';
import { assertSame } from './assertions';

describe('mod', () => {
  it('return correct results', () => {
    assertSame(MpZ.from(0x0) % MpZ.from(0x1), 0);
    assertSame(MpZ.from(0x1) % MpZ.from(0x1), 0);
    assertSame(MpZ.from(0xdeadbeef) % MpZ.from(0x1), 0);
    assertSame(MpZ.from('0xDEADBEEFDEADBEEFDEADBEEF') % MpZ.from(0x1), 0);

    assertSame(MpZ.from(0x2) % MpZ.from(0x2), 0);
    assertSame(MpZ.from(0x3) % MpZ.from(0x2), 1);

    assertSame(MpZ.from(0xdeadbeef) % MpZ.from(0x2), 1);
    assertSame(MpZ.from(0xfffffffe) % MpZ.from(0xf), 0xe);
    assertSame(MpZ.from('0xDEADBEEFDEADBEEFDEADBEEF') % MpZ.from(0x2), 1);
    assertSame(MpZ.from('0xFFFFFFFFFFFFFFFFFFFFFFFE') % MpZ.from(0xf), 0xe);

    assertSame(MpZ.from(123456789) % MpZ.from(100), 89);
    assertSame(MpZ.from(123456789) % MpZ.from(1000), 789);

    assertSame(MpZ.from(10 ** 20 + 7) % MpZ.from(10 ** 20), 7);

    assertSame(MpZ.from(10 ** 20) % MpZ.from(7), 5);
    assertSame(MpZ.from(-(10 ** 20)) % MpZ.from(7), -5); // TODO: check this
    assertSame(MpZ.from(-(10 ** 20)) % MpZ.from(-7), -5); // TODO: check this
    assertSame(MpZ.from(-(10 ** 20)) % MpZ.from(-7), -5);
  });

  it('large m', () => {
    const l = MpZ.from('542101086242752217003726400434970855712890625');

    assertSame(l.mod(MpZ.from('10000000000000')), '855712890625');
    assertSame(l.mod(MpZ.from('100000000000000000000')), '434970855712890625');
    assertSame(
      l.mod(MpZ.from('1000000000000000000000000000000000000000000000')),
      '542101086242752217003726400434970855712890625',
    );
  });
});
