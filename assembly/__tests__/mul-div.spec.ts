import { MpZ } from '..';
import { assertSame } from './assertions';

function fact(n: u32): MpZ {
  let a = MpZ.from(1);
  for (let i: u32 = 1; i <= n; ++i) {
    a *= MpZ.from(i);
  }
  return a;
}

describe('mul', () => {
  it('return correct positive results', () => {
    assertSame(MpZ.from(0x0) * MpZ.from(0x0), 0);
    assertSame(MpZ.from(0x1) * MpZ.from(0x1), 1);
    assertSame(MpZ.from(0x10) * MpZ.from(0x10), 0x100);
    assertSame(MpZ.from(u32(0xffff)) * MpZ.from(u32(0xffff)), 0xfffe0001);
    assertSame(
      MpZ.from(0xffffffff) * MpZ.from(0xffffffff),
      MpZ.from('0xFFFFFFFE00000001')
    );
  });

  it('handles large numbers', () => {
    assertSame(
      MpZ.from('0xDEADBEEFDEADBEEF') * MpZ.from('0xFEEBDAEDFEEBDAED'),
      '294743557975626283697822613802522659139'
    );
    assertSame(
      MpZ.from('0xDEADBEEFDEADBEEFFEEBDAEDFEEBDAED') *
        MpZ.from('0xFEEBDAEDFEEBDAEDDEADBEEFDEADBEEF'),
      '100296035542644961557257340252644763255005271048861661491165839172406949071171'
    );
  });

  it('handles numbers of different sizes', () => {
    assertSame(
      MpZ.from('0xDEADBEEFDEADBEEF') * MpZ.from('0xBEEF'),
      '784297329647668582589217'
    );
    assertSame(
      MpZ.from('0xDEAD') * MpZ.from('0xFEEBDAEDFEEBDAEDDEADBEEFDEADBEEF'),
      '19316061086111606802384272818067605074823555'
    );
  });

  it('handles negative numbers', () => {
    assertSame(MpZ.from(-0x10) * MpZ.from(-0x10), 0x100);
    assertSame(MpZ.from(0x10) * MpZ.from(-0x10), -0x100);
    assertSame(MpZ.from(-0x10) * MpZ.from(0x10), -0x100);
    assertSame(MpZ.from('-0xffff') * MpZ.from('0xffff'), -0xfffe0001);
    assertSame(
      MpZ.from('-0xffffffff') * MpZ.from('0xffffffff'),
      MpZ.from('-0xfffffffe00000001')
    );
  });

  it('handles zero', () => {
    assertSame(MpZ.from(0x10) * MpZ.from(0x0), 0);
    assertSame(MpZ.from(0x0) * MpZ.from(0x10), 0);
    assertSame(MpZ.from(0x0) * MpZ.from(0x0), 0);
  });
});

describe('div', () => {
  it('returns correct results', () => {
    assertSame(MpZ.from(1) / MpZ.from(1), 1);
    assertSame(MpZ.from(2) / MpZ.from(1), 2);
    assertSame(MpZ.from(4) / MpZ.from(1), 4);

    assertSame(MpZ.from(2) / MpZ.from(4), 0);
    assertSame(MpZ.from(0xffff) / MpZ.from(0xffff), 1);
    assertSame(MpZ.from(0xfff) / MpZ.from(0xffff), 0);

    assertSame(MpZ.from(2) / MpZ.from(-2), -1);
    assertSame(MpZ.from(-2) / MpZ.from(2), -1);
    assertSame(MpZ.from(-2) / MpZ.from(-2), 1);

    assertSame(MpZ.from('0xbeef') / MpZ.from('16'), 0xbee);
    assertSame(MpZ.from('0x1000') / MpZ.from(0x10), 0x100);
    assertSame(MpZ.from('0x10000000') / MpZ.from(0x10), 0x1000000);
    assertSame(MpZ.from('0xDEADBEEF') / MpZ.from('16'), 0xdeadbee);
    assertSame(MpZ.from('0xDEADBEEF') / MpZ.from('0x100'), 0xdeadbe);
    assertSame(MpZ.from('0xDEADBEEF') / MpZ.from('0x10000000'), 0xd);
    assertSame(MpZ.from('0xFFFFFFFF') / MpZ.from('0xf'), 0x11111111);
    assertSame(MpZ.from('0xFFFFFFFF') / MpZ.from('0xffffffff'), 0x1);
    assertSame(MpZ.from('0xFFFFFFFF') / MpZ.from('0xfffffff'), 0x10);
  });

  it('returns correct values for large numbers', () => {
    assertSame(
      MpZ.from(
        '0xFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAED'
      ) /
        MpZ.from(
          '0x00000000BEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEAD'
        ),
      5734240797
    );
    assertSame(
      MpZ.from(
        '0xFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAED'
      ) /
        MpZ.from(
          '0x0000DAEDBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEAD'
        ),
      76310
    );

    assertSame(
      MpZ.from('0xBEEFDEADBEEFDEADBEEFDEADBEEFDEAD') /
        MpZ.from('0xBEEFDEADBEEFDEAD'),
      '18446744073709551617'
    );
    assertSame(
      MpZ.from('0xDEADBEEFDEADBEEF00000000') /
        MpZ.from('0xDEADBEEFDEADBEEF0000'),
      0x10000
    );

    assertSame(
      MpZ.from('542101086242752217003726400434970855712890625') /
        MpZ.from('100000000000000000000'),
      '5421010862427522170037264'
    );
    assertSame(
      MpZ.from('542101086242752217003726400434970855712890625') /
        MpZ.from('100000000000000000000'),
      '5421010862427522170037264'
    );
  });

  it('returns correct result for special cases', () => {
    assertSame(
      MpZ.from('34125305527818743474129076526') /
        MpZ.from('9580783237862390338'),
      3561849243
    );
  });

  it('throws on div by zero', () => {
    expect(() => {
      MpZ.from(-0x10) / MpZ.from(0);
    }).toThrow();
  });
});
