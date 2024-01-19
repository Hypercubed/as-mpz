import { MpZ } from '..';
import { assertSame } from './assertions';

describe('shift', () => {
  it('mul pow2', () => {
    assertSame(MpZ.from('0x1').mul_pow2(1), 2);
    assertSame(
      MpZ.from('0x1234567890ABCDEF').mul_pow2(0),
      MpZ.from('0x1234567890ABCDEF'),
    );
    assertSame(
      MpZ.from('0x1234567890ABCDEF').mul_pow2(4),
      MpZ.from('0x1234567890ABCDEF0'),
    );
    assertSame(
      MpZ.from('0x1234567890ABCDEF').mul_pow2(8),
      MpZ.from('0x1234567890ABCDEF00'),
    );
    assertSame(
      MpZ.from('0x1234567890ABCDEF').mul_pow2(32),
      MpZ.from('0x1234567890ABCDEF00000000'),
    );
    assertSame(
      MpZ.from('0x1234567890ABCDEF').mul_pow2(64),
      MpZ.from('0x1234567890ABCDEF0000000000000000'),
    );
    assertSame(
      MpZ.from('0x1234567890ABCDEF').mul_pow2(128),
      MpZ.from('0x1234567890ABCDEF00000000000000000000000000000000'),
    );
  });

  it('div pow2', () => {
    assertSame(MpZ.from('0x2').div_pow2(0x1), 1);
    assertSame(MpZ.from('0x1234567890ABCDEF').div_pow2(0), 0x1234567890abcdef);
    assertSame(MpZ.from('0x1234567890ABCDEF').div_pow2(4), 0x1234567890abcde);
    assertSame(MpZ.from('0x1234567890ABCDEF').div_pow2(8), 0x1234567890abcd);
    assertSame(MpZ.from('0x1234567890ABCDEF').div_pow2(32), 0x12345678);
    assertSame(MpZ.from('0x1234567890ABCDEF').div_pow2(64), 0);

    assertSame(
      MpZ.from('0x1234567890ABCDEF00000000000000000000000000000000').div_pow2(
        0,
      ),
      MpZ.from('0x1234567890ABCDEF00000000000000000000000000000000'),
    );
    assertSame(
      MpZ.from('0x1234567890ABCDEF00000000000000000000000000000000').div_pow2(
        4,
      ),
      MpZ.from('0x1234567890ABCDEF0000000000000000000000000000000'),
    );
    assertSame(
      MpZ.from('0x1234567890ABCDEF00000000000000000000000000000000').div_pow2(
        8,
      ),
      MpZ.from('0x1234567890ABCDEF000000000000000000000000000000'),
    );
    assertSame(
      MpZ.from('0x1234567890ABCDEF00000000000000000000000000000000').div_pow2(
        32,
      ),
      MpZ.from('0x1234567890ABCDEF000000000000000000000000'),
    );
    assertSame(
      MpZ.from('0x1234567890ABCDEF00000000000000000000000000000000').div_pow2(
        64,
      ),
      MpZ.from('0x1234567890ABCDEF0000000000000000'),
    );
    assertSame(
      MpZ.from('0x1234567890ABCDEF00000000000000000000000000000000').div_pow2(
        128,
      ),
      0x1234567890abcdef,
    );
  });
});
