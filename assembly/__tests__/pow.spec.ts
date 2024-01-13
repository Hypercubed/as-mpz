import { MpZ } from '..';
import { assertSame } from './assertions';

describe('pow', () => {
  it('return correct results', () => {
    assertSame(MpZ.from(0) ** MpZ.ONE, 0);
    assertSame(MpZ.from(1) ** MpZ.ONE, 1);
    assertSame(MpZ.from(0xdeadbeef) ** MpZ.ONE, 0xdeadbeef);

    assertSame(MpZ.from(1) ** MpZ.from('0xdeadbeefdeadbeef'), 1);

    assertSame(MpZ.from(0) ** MpZ.TWO, 0);
    assertSame(MpZ.from(1) ** MpZ.TWO, 1);
    assertSame(MpZ.from(0xdeadbeef) ** MpZ.TWO, '13957162197951816481');
    assertSame(
      MpZ.from(0xdeadbeef) ** MpZ.from(3),
      '52142960857923402497294780879',
    );

    assertSame(
      MpZ.from(5).pow(4).pow(3).pow(2).pow(1),
      MpZ.from('0xD3C21BCECCEDA1'),
    );
  });

  it('n < 0', () => {
    assertSame(MpZ.from(0) ** MpZ.from(-1), 0);
  });

  it('a < 0', () => {
    assertSame(MpZ.from(-0x1) ** MpZ.ZERO, 1);
    assertSame(MpZ.from(-0x1) ** MpZ.ONE, -1);
    assertSame(MpZ.from(-0x1) ** MpZ.TWO, 1);

    assertSame(MpZ.from(-0xdeadbeef) ** MpZ.ONE, -0xdeadbeef);
    assertSame(MpZ.from(-0xdeadbeef) ** MpZ.TWO, '13957162197951816481');

    assertSame(
      MpZ.from(-0xdeadbeef) ** MpZ.from(3),
      '-52142960857923402497294780879',
    );
  });

  it('large powers', () => {
    assertSame(
      MpZ.from('2') ** MpZ.from('0xFF'),
      '57896044618658097711785492504343953926634992332820282019728792003956564819968',
    );

    const x = MpZ.from('2') ** MpZ.from('0xFFFF');
    expect(x.toString().length).toBe(19729);

    const p = MpZ.from(5) ** (MpZ.from(4) ** MpZ.from(3));
    assertSame(p, '542101086242752217003726400434970855712890625');

    const s = (
      MpZ.from(5) **
      (MpZ.from(4) ** (MpZ.from(3) ** (MpZ.from(2) ** MpZ.from(1))))
    ).toString();

    expect(s.length).toBe(183231);
    expect(s.slice(0, 20)).toBe('62060698786608744707');
    expect(s.slice(-20)).toBe('92256259918212890625');
  });
});
