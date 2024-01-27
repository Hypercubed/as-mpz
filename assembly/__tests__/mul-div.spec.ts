import { MpZ } from '..';
import { assertSame } from './assertions';

describe('mul', () => {
  it('return correct positive results', () => {
    assertSame(MpZ.from(0x0).mul(0x0), 0);
    assertSame(MpZ.from(0x1).mul(0x1), 1);
    assertSame(MpZ.from(0x10).mul(0x10), 0x100);
    assertSame(MpZ.from(u32(0xffff)).mul(u32(0xffff)), 0xfffe0001);
    assertSame(
      MpZ.from(0xffffffff).mul(0xffffffff),
      MpZ.from('0xFFFFFFFE00000001')
    );
  });

  it('handles large numbers', () => {
    assertSame(
      MpZ.from('0xDEADBEEFDEADBEEF').mul('0xFEEBDAEDFEEBDAED'),
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
      MpZ.from('0xDEADBEEFDEADBEEF').mul('0xBEEF'),
      '784297329647668582589217'
    );
    assertSame(
      MpZ.from('0xDEAD').mul('0xFEEBDAEDFEEBDAEDDEADBEEFDEADBEEF'),
      '19316061086111606802384272818067605074823555'
    );
  });

  it('handles negative numbers', () => {
    assertSame(MpZ.from(-0x10).mul(-0x10), 0x100);
    assertSame(MpZ.from(0x10).mul(-0x10), -0x100);
    assertSame(MpZ.from(-0x10).mul(0x10), -0x100);
    assertSame(MpZ.from('-0xffff').mul('0xffff'), -0xfffe0001);
    assertSame(
      MpZ.from('-0xffffffff').mul('0xffffffff'),
      MpZ.from('-0xfffffffe00000001')
    );
  });

  it('handles zero', () => {
    assertSame(MpZ.from(0x10).mul(0x0), 0);
    assertSame(MpZ.from(0x0).mul(0x10), 0);
    assertSame(MpZ.from(0x0).mul(0x0), 0);
  });
});

describe('div', () => {
  it('returns correct results', () => {
    assertSame(MpZ.from(1).div(1), 1);
    assertSame(MpZ.from(2).div(1), 2);
    assertSame(MpZ.from(4).div(1), 4);

    assertSame(MpZ.from(2).div(4), 0);
    assertSame(MpZ.from(0xffff).div(0xffff), 1);
    assertSame(MpZ.from(0xfff).div(0xffff), 0);

    assertSame(MpZ.from(2).div(-2), -1);
    assertSame(MpZ.from(-2).div(2), -1);
    assertSame(MpZ.from(-2).div(-2), 1);

    assertSame(MpZ.from('0xbeef').div('16'), 0xbee);
    assertSame(MpZ.from('0x1000').div(0x10), 0x100);
    assertSame(MpZ.from('0x10000000').div(0x10), 0x1000000);
    assertSame(MpZ.from('0xDEADBEEF').div('16'), 0xdeadbee);
    assertSame(MpZ.from('0xDEADBEEF').div('0x100'), 0xdeadbe);
    assertSame(MpZ.from('0xDEADBEEF').div('0x10000000'), 0xd);
    assertSame(MpZ.from('0xFFFFFFFF').div('0xf'), 0x11111111);
    assertSame(MpZ.from('0xFFFFFFFF').div('0xffffffff'), 0x1);
    assertSame(MpZ.from('0xFFFFFFFF').div('0xfffffff'), 0x10);
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
      MpZ.from(-0x10).div(0);
    }).toThrow();
  });
});

describe('operators', () => {
  it('supports operators', () => {
    assertSame(MpZ.from(5) * MpZ.from(3), 15);
    assertSame(MpZ.from(15) / MpZ.from(3), 5);

    let x = MpZ.from(5);
    assertSame(x, 5);
    x *= MpZ.from(3);
    assertSame(x, 15);
    x /= MpZ.from(5);
    assertSame(x, 3);
  });
});
