import { MpZ } from '..';
import { assertSame } from './assertions';

describe('pow', () => {
  it('return correct results', () => {
    assertSame(MpZ.from(1).pow(MpZ.ONE), 1);
    assertSame(MpZ.from(0xdeadbeef).pow(MpZ.ONE), 0xdeadbeef);

    assertSame(MpZ.from(1).pow('0xdeadbeefdeadbeef'), 1);

    assertSame(MpZ.from(1).pow(MpZ.TWO), 1);
    assertSame(MpZ.from(0xdeadbeef).pow(MpZ.TWO), '13957162197951816481');
    assertSame(MpZ.from(0xdeadbeef).pow(3), '52142960857923402497294780879');

    assertSame(
      MpZ.from(5).pow(4).pow(3).pow(2).pow(1),
      MpZ.from('0xD3C21BCECCEDA1')
    );
  });

  it('n === 0', () => {
    assertSame(MpZ.from(0).pow(0), 1);
    assertSame(MpZ.from(1).pow(0), 1);
    assertSame(MpZ.from(0xdeadbeef).pow(0), 1);
  });

  it('throws if n < 0', () => {
    expect(() => {
      MpZ.from(0).pow(-1);
    }).toThrow();

    expect(() => {
      MpZ.from(1).pow(-1);
    }).toThrow();

    expect(() => {
      MpZ.from(-0xdeadbeef).pow(-0xdeadbeef);
    }).toThrow();
  });

  it('a === 0', () => {
    assertSame(MpZ.from(0).pow(0), 1);
    assertSame(MpZ.from(0).pow(1), 0);
    assertSame(MpZ.from(0).pow(2), 0);
    assertSame(MpZ.from(0).pow(0xdeadbeef), 0);
  });

  it('a < 0', () => {
    assertSame(MpZ.from(-0x1).pow(MpZ.ZERO), 1);
    assertSame(MpZ.from(-0x1).pow(MpZ.ONE), -1);
    assertSame(MpZ.from(-0x1).pow(MpZ.TWO), 1);

    assertSame(MpZ.from(-0xdeadbeef).pow(MpZ.ONE), -0xdeadbeef);
    assertSame(MpZ.from(-0xdeadbeef).pow(MpZ.TWO), '13957162197951816481');

    assertSame(MpZ.from(-0xdeadbeef).pow(3), '-52142960857923402497294780879');
  });

  it('large powers', () => {
    assertSame(
      MpZ.from('2').pow('0xFF'),
      '57896044618658097711785492504343953926634992332820282019728792003956564819968'
    );

    const x = MpZ.from('2').pow('0xFFFF');
    expect(x.toString().length).toBe(19729);

    const p = MpZ.from(5).pow(MpZ.from(4).pow(3));
    assertSame(p, '542101086242752217003726400434970855712890625');

    const s = (
      MpZ.from(5) ** MpZ.from(4).pow(MpZ.from(3).pow(MpZ.from(2).pow(1)))
    ).toString();

    expect(s.length).toBe(183231);
    expect(s.slice(0, 20)).toBe('62060698786608744707');
    expect(s.slice(-20)).toBe('92256259918212890625');
  });

  it('supports operators', () => {
    assertSame(MpZ.from(5) ** MpZ.from(3), 125);

    let x = MpZ.from(5);
    assertSame(x, 5);
    x **= MpZ.from(3);
    assertSame(x, 125);
  });

  it('Kunth test', () => {
    const t = MpZ.from(10);
    const m = MpZ.from(3);
    const n = MpZ.from(8);

    const p = (t ** m - MpZ.ONE) * (t ** n - MpZ.ONE);
    expect(p.toString()).toBe('99899999001');
  });
});

describe('powMod', () => {
  it('return correct results', () => {
    assertSame(MpZ.from(0).powMod(1, 1), 0);
    assertSame(MpZ.from(1).powMod(1, 1), 0);

    assertSame(MpZ.from(0).powMod(1, 2), 0);
    assertSame(MpZ.from(1).powMod(1, 2), 1);

    assertSame(MpZ.from(0xdeadbeef).powMod(2, 3), 1);
    assertSame(MpZ.from(0xdeadbeef).powMod(2, 10), 1);
    assertSame(MpZ.from(0xdeadbeef).powMod(2, 100), 81);

    assertSame(MpZ.from(0xdeadbeef).powMod(3, 2), 1);
    assertSame(MpZ.from(0xdeadbeef).powMod(3, 10), 9);
    assertSame(MpZ.from(0xdeadbeef).powMod(3, 100), 79);

    assertSame(MpZ.from(0xdeadbeef).powMod(4, 2), 1);
    assertSame(MpZ.from(0xdeadbeef).powMod(4, 10), 1);
    assertSame(MpZ.from(0xdeadbeef).powMod(4, 100), 61);

    assertSame(MpZ.from(0xdeadbeef).powMod(5, 2), 1);
    assertSame(MpZ.from(0xdeadbeef).powMod(5, 10), 9);
    assertSame(MpZ.from(0xdeadbeef).powMod(5, 100), 99);
  });

  it('n === 0', () => {
    assertSame(MpZ.from(0).powMod(0, 10), 1);
    assertSame(MpZ.from(1).powMod(0, 10), 1);
    assertSame(MpZ.from(0xdeadbeef).powMod(0, 10), 1);
  });

  it('returns correct results for negative numbers', () => {
    assertSame(MpZ.from(-1).powMod(1, 1), 0);
    assertSame(MpZ.from(-1).powMod(1, 2), 1);
    assertSame(MpZ.from(-0xdeadbeef).powMod(2, 100), 81);
    assertSame(MpZ.from(-0xdeadbeef).powMod(3, 100), 21);
    assertSame(MpZ.from(-0xdeadbeef).powMod(4, 100), 61);
    assertSame(MpZ.from(-0xdeadbeef).powMod(5, 100), 1);
  });

  it('throws on mod by zero', () => {
    expect(() => {
      MpZ.from(1).powMod(2, 0);
    }).toThrow();
  });

  it('throws on mod < 0', () => {
    expect(() => {
      MpZ.from(1).powMod(2, -2);
    }).toThrow();
  });

  it('throws on rhs < 0', () => {
    expect(() => {
      MpZ.from(1).powMod(-2, 2);
    }).toThrow();
  });
});
