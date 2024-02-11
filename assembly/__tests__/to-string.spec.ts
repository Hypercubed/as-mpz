import { MpZ } from '..';

describe('MpZ', () => {
  it('.toDecimal()', () => {
    expect(MpZ.from('0xDEADBEEF').toDecimal()).toBe('3735928559');
    expect(MpZ.from('-0xDEADBEEF').toDecimal()).toBe('-3735928559');

    // expect(MpZ.from(10).pow(10).toDecimal()).toBe('10000000000');

    const f = MpZ.from(100).fact().toDecimal();
    expect(f.slice(0, 10)).toBe('9332621544');
    expect(f.slice(-10)).toBe('0000000000');
  });

  it('.toHex()', () => {
    expect(MpZ.from(0xff).toHex()).toBe('0xff');
    expect(MpZ.from(-0xff).toHex()).toBe('-0xff');

    expect(MpZ.from(0xffff).toHex()).toBe('0xffff');
    expect(MpZ.from(-0xffff).toHex()).toBe('-0xffff');

    expect(MpZ.from(0xdeadbeef).toHex()).toBe('0xdeadbeef');
    expect(MpZ.from(i64(-0xdeadbeef)).toHex()).toBe('-0xdeadbeef');

    expect(MpZ.from('0xDEADBEEFDEADBEEF').toHex()).toBe('0xdeadbeefdeadbeef');
    expect(MpZ.from('-0xDEADBEEFDEADBEEF').toHex()).toBe('-0xdeadbeefdeadbeef');
  });

  it('toString(2)', () => {
    expect(MpZ.from(0xff).toString(2)).toBe('11111111');
  });

  it('toString(36)', () => {
    expect(MpZ.from(0xff).toString(36)).toBe('73');
  });

  it('.toExponential()', () => {
    expect(MpZ.from(1).toExponential(0)).toBe('1e+0');
    expect(MpZ.from(1).toExponential(2)).toBe('1.00e+0');
    expect(MpZ.from(1).toExponential(5)).toBe('1.00000e+0');

    expect(MpZ.from(0xff).toExponential(0)).toBe('3e+2');
    expect(MpZ.from(0xff).toExponential(2)).toBe('2.55e+2');
    expect(MpZ.from(0xff).toExponential(5)).toBe('2.55000e+2');

    expect(MpZ.from(-2).toExponential(0)).toBe('-2e+0');
    expect(MpZ.from(-2).toExponential(2)).toBe('-2.00e+0');
    expect(MpZ.from(-2).toExponential(5)).toBe('-2.00000e+0');

    expect(MpZ.from(-0xffff).toExponential(0)).toBe('-7e+4');
    expect(MpZ.from(-0xffff).toExponential(2)).toBe('-6.55e+4');
    expect(MpZ.from(-0xffff).toExponential(5)).toBe('-6.55350e+4');
  });
});
