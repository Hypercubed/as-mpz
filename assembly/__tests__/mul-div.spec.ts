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
      MpZ.from('0xDEADBEEFDEADBEEFFEEBDAEDFEEBDAED') *
        MpZ.from('0xFEEBDAEDFEEBDAEDDEADBEEFDEADBEEF'),
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
  it('returns correct results', () => {
    assertSame(MpZ.from(-0x10) * MpZ.from(-0x10), 0x100);
    assertSame(MpZ.from(0x10) * MpZ.from(-0x10), -0x100);
    assertSame(MpZ.from(-0x10) * MpZ.from(0x10), -0x100);
  });

  it('returns correct values for large numbers', () => {
    assertSame(
      MpZ.from(
        '0xFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAED',
      ) /
        MpZ.from(
          '0x00000000BEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEAD',
        ),
      5734240797,
    );
    assertSame(
      MpZ.from(
        '0xFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAED',
      ) /
        MpZ.from(
          '0x0000DAEDBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEAD',
        ),
      76310,
    );

    assertSame(
      MpZ.from('0xBEEFDEADBEEFDEADBEEFDEADBEEFDEAD') /
        MpZ.from('0xBEEFDEADBEEFDEAD'),
      '18446744073709551617',
    );
    assertSame(
      MpZ.from('0xDEADBEEFDEADBEEF00000000') /
        MpZ.from('0xDEADBEEFDEADBEEF0000'),
      0x10000,
    );

    assertSame(
      MpZ.from('542101086242752217003726400434970855712890625') /
        MpZ.from('100000000000000000000'),
      '5421010862427522170037264',
    );
    assertSame(
      MpZ.from('542101086242752217003726400434970855712890625') /
        MpZ.from('100000000000000000000'),
      '5421010862427522170037264',
    );

    assertSame(
      fact(1000) / fact(500),
      '329788636409885371220242520701162617069964856979816928189859032090942479717817520517762864144282860642511610038896581182026805940691096457163819146404867449323195951016063077387633734854267300606090269861265477271286488576761297484044021454635363397236388600521295263570193996353801020289037482628493201848961418121619819772764993033522996635864344333906429575480132415225196248339593869027449698810760918514647597480713398046665485357617383939595208066363445344114949740210480721402476538003489320643962503978159438679308830234034782545381994664487532357468065201295553689118295945581602629007720957929180752212770840487049163879535858780678097564405860520561251708337074514204325431100590616437619493225353351385282389526327254303162475735005096296377910576440110923510611478455640616892001930824134879251166941326675998088653284459628349959991040037803289845575791602454929778448873072964281350714756584208225937046706839777918383449205581955131192577936383783696093755727532986792258013308284866421680502348502137582409888931707193522417988009028652278091249663021542543131557667939046775828857498243505708092885140538311156118607423712339447052595796169409094245071458170610310022757008405846321265492283219335864399905370457791539340714797690375415057559712073706121243182307015204282485816648002227404800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    );
  });

  it('returns correct result for special case', () => {
    assertSame(
      MpZ.from('34125305527818743474129076526') /
        MpZ.from('9580783237862390338'),
      3561849243,
    );
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
    assertSame(
      MpZ.from('222222222222222222222222')._div2(),
      '111111111111111111111111',
    );

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
