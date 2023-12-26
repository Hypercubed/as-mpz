import { MpZ } from '..';
import { assertSame } from './assertions';

describe('mul', () => {
  it('return correct results', () => {
    assertSame(MpZ.from(0x0) * MpZ.from(0x0), 0);
    assertSame(MpZ.from(0x1) * MpZ.from(0x1), 1);
    assertSame(MpZ.from(0x10) * MpZ.from(0x10), 0x100);
    assertSame(MpZ.from(u32(0xffff)) * MpZ.from(u32(0xffff)), 0xfffe0001);
    assertSame(
      MpZ.from(0xffffffff) * MpZ.from(0xffffffff),
      MpZ.from('0xFFFFFFFE00000001'),
    );
  });

  it('handles large numbers', () => {
    assertSame(
      MpZ.from('0xDEADBEEFDEADBEEF') * MpZ.from('0xFEEBDAEDFEEBDAED'),
      '294743557975626283697822613802522659139',
    );
    assertSame(
      MpZ.from('0xDEADBEEFDEADBEEFFEEBDAEDFEEBDAED') * MpZ.from('0xFEEBDAEDFEEBDAEDDEADBEEFDEADBEEF'),
      '100296035542644961557257340252644763255005271048861661491165839172406949071171',
    );
  });

  it('handles numbers of different sizes', () => {
    assertSame(
      MpZ.from('0xDEADBEEFDEADBEEF') * MpZ.from('0xBEEF'),
      '784297329647668582589217',
    );
    assertSame(
      MpZ.from('0xDEAD') * MpZ.from('0xFEEBDAEDFEEBDAEDDEADBEEFDEADBEEF'),
      '19316061086111606802384272818067605074823555',
    );
  });

  it('handles negative numbers', () => {
    assertSame(MpZ.from(-0x10) * MpZ.from(-0x10), 0x100);
    assertSame(MpZ.from(0x10) * MpZ.from(-0x10), -0x100);
    assertSame(MpZ.from(-0x10) * MpZ.from(0x10), -0x100);
  });

  it('handles zero', () => {
    assertSame(MpZ.from(0x10) * MpZ.from(0x0), 0);
    assertSame(MpZ.from(0x0) * MpZ.from(0x10), 0);
    assertSame(MpZ.from(0x0) * MpZ.from(0x0), 0);
  });
});

describe('div', () => {
  it('return correct results', () => {
    assertSame(MpZ.from(-0x10) * MpZ.from(-0x10), 0x100);
    assertSame(MpZ.from(0x10) * MpZ.from(-0x10), -0x100);
    assertSame(MpZ.from(-0x10) * MpZ.from(0x10), -0x100);
  });
});

describe('div2', () => {
  it('return correct results', () => {
    // @ts-ignore
    assertSame(MpZ.from(10)._div2(), 5);
    // @ts-ignore
    assertSame(MpZ.from(100)._div2(), 50);
    // @ts-ignore
    assertSame(MpZ.from(1000)._div2(), 500);
    // @ts-ignore
    assertSame(MpZ.from('10000000000000000')._div2(), 5000000000000000);

    // @ts-ignore
    assertSame(MpZ.from(22)._div2(), 11);
    // @ts-ignore
    assertSame(MpZ.from(222)._div2(), 111);
    // @ts-ignore
    assertSame(MpZ.from(2222)._div2(), 1111);
    // @ts-ignore
    assertSame(MpZ.from('222222222222222222222222')._div2(), '111111111111111111111111');

    // @ts-ignore
    assertSame(MpZ.from(12)._div2(), 6);
    // @ts-ignore
    assertSame(MpZ.from(123)._div2(), 61);
    // @ts-ignore
    assertSame(MpZ.from(1234)._div2(), 617);
    // @ts-ignore
    assertSame(MpZ.from('12345678901234567890')._div2(), '6172839450617283945');
  });
});
