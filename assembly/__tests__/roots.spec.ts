import { MpZ } from '..';
import { pow } from '../main';
import { assertSame } from './assertions';

const M = MpZ.from(10).pow(19);

describe('isqrt', () => {
  it('return correct results', () => {
    assertSame(MpZ.from(0).isqrt(), 0);
    assertSame(MpZ.from(1).isqrt(), 1);
    assertSame(MpZ.from(2).isqrt(), 1);
    assertSame(MpZ.from(3).isqrt(), 1);
    assertSame(MpZ.from(4).isqrt(), 2);
    assertSame(MpZ.from(16).isqrt(), 4);
    assertSame(MpZ.from(64).isqrt(), 8);

    assertSame(MpZ.from(2).mul(M.pow(2)).isqrt(), '14142135623730950488');
    assertSame(MpZ.from(3).mul(M.pow(2)).isqrt(), '17320508075688772935');
  });
});

describe('iroot', () => {
  it('return correct results', () => {
    assertSame(MpZ.from(0).iroot(2), 0);
    assertSame(MpZ.from(1).iroot(2), 1);

    assertSame(MpZ.from(0).iroot(3), 0);
    assertSame(MpZ.from(1).iroot(3), 1);
    assertSame(MpZ.from(8).iroot(3), 2);
    assertSame(MpZ.from(64).iroot(3), 4);

    assertSame(MpZ.from(2).mul(M.pow(3)).iroot(3), '12599210498948731647');

    assertSame(MpZ.from(3).mul(M.pow(3)).iroot(3), '14422495703074083823');
    assertSame(MpZ.from(-3).mul(M.pow(3)).iroot(3), '-14422495703074083823');

    assertSame(MpZ.from(7).mul(M.pow(3)).iroot(3), '19129311827723891011');
    assertSame(MpZ.from(-7).mul(M.pow(3)).iroot(3), '-19129311827723891011');

    assertSame(
      MpZ.from(2).mul(MpZ.from(1000000000).pow(12)).iroot(12),
      '1059463094'
    );
  });
});
