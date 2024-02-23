import { MpZ } from '..';
import { BigInt } from 'as-bigint/assembly/BigInt';

const a = '0xFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAED';
const b = '0xDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF';
const mpzA = MpZ.from(a);
const mpzB = MpZ.from(b);

const bigIntA = BigInt.from(a);
const bigIntB = BigInt.from(b);

suite('add large', () => {
  bench('MpZ#__uadd (large)', () => {
    // @ts-ignore
    blackbox(mpzA.__uadd(mpzB));
  });

  bench('MpZ#add (large)', () => {
    blackbox(mpzA.add(mpzB));
  });

  bench('BigInt#add (large)', () => {
    blackbox(bigIntA.add(bigIntB));
  });
});

const c = 0xbeef;
const d = 0xdead;
const mpzC = blackbox(MpZ.from(c));
const mpzD = blackbox(MpZ.from(d));
const bigIntC = blackbox(BigInt.from(c));
const bigIntD = blackbox(BigInt.from(d));

suite('add small', () => {
  bench('native', () => {
    blackbox(c + d);
  });

  bench('MpZ#_uaddToU32 (small)', () => {
    // @ts-ignore
    blackbox(mpzC._uaddU32(d));
  });

  bench('MpZ#add (small)', () => {
    blackbox(mpzC.add(mpzD));
  });

  bench('BigInt#add (small)', () => {
    blackbox(bigIntC.add(bigIntD));
  });
});
