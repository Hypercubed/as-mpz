import { MpZ } from '..';
import { assertSame } from './assertions';

describe('shift', () => {
  it('left shift', () => {
    assertSame(MpZ.from('0x1').shl(1), 2);
    assertSame(
      MpZ.from('0x1234567890ABCDEF').shl(0),
      MpZ.from('0x1234567890ABCDEF'),
    );
    assertSame(
      MpZ.from('0x1234567890ABCDEF').shl(4),
      MpZ.from('0x1234567890ABCDEF0'),
    );
    assertSame(
      MpZ.from('0x1234567890ABCDEF').shl(8),
      MpZ.from('0x1234567890ABCDEF00'),
    );
    assertSame(
      MpZ.from('0x1234567890ABCDEF').shl(32),
      MpZ.from('0x1234567890ABCDEF00000000'),
    );
    assertSame(
      MpZ.from('0x1234567890ABCDEF').shl(64),
      MpZ.from('0x1234567890ABCDEF0000000000000000'),
    );
    assertSame(
      MpZ.from('0x1234567890ABCDEF').shl(128),
      MpZ.from('0x1234567890ABCDEF00000000000000000000000000000000'),
    );
  });

  it('right shift', () => {
    assertSame(MpZ.from('0x2').shr(0x1), 1);
    assertSame(MpZ.from('0x1234567890ABCDEF').shr(0), 0x1234567890abcdef);
    assertSame(MpZ.from('0x1234567890ABCDEF').shr(4), 0x1234567890abcde);
    assertSame(MpZ.from('0x1234567890ABCDEF').shr(8), 0x1234567890abcd);
    assertSame(MpZ.from('0x1234567890ABCDEF').shr(32), 0x12345678);
    assertSame(MpZ.from('0x1234567890ABCDEF').shr(64), 0);

    assertSame(
      MpZ.from('0x1234567890ABCDEF00000000000000000000000000000000').shr(0),
      MpZ.from('0x1234567890ABCDEF00000000000000000000000000000000'),
    );
    assertSame(
      MpZ.from('0x1234567890ABCDEF00000000000000000000000000000000').shr(4),
      MpZ.from('0x1234567890ABCDEF0000000000000000000000000000000'),
    );
    assertSame(
      MpZ.from('0x1234567890ABCDEF00000000000000000000000000000000').shr(8),
      MpZ.from('0x1234567890ABCDEF000000000000000000000000000000'),
    );
    assertSame(
      MpZ.from('0x1234567890ABCDEF00000000000000000000000000000000').shr(32),
      MpZ.from('0x1234567890ABCDEF000000000000000000000000'),
    );
    assertSame(
      MpZ.from('0x1234567890ABCDEF00000000000000000000000000000000').shr(64),
      MpZ.from('0x1234567890ABCDEF0000000000000000'),
    );
    assertSame(
      MpZ.from('0x1234567890ABCDEF00000000000000000000000000000000').shr(128),
      0x1234567890abcdef,
    );
  });
});
