import { MpZ } from '..';
import { BigInt } from 'as-bigint/assembly/BigInt';

const a = '0xFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAED';
const b = '0xDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF';
const mpzA = blackbox(MpZ.from(a));
const mpzB = blackbox(MpZ.from(b));

const bigIntA = blackbox(BigInt.from(a));
const bigIntB = blackbox(BigInt.from(b));

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
const mpzC = blackbox(MpZ.from(c));
const bigIntC = blackbox(BigInt.from(c));

suite('add small', () => {
  bench('MpZ#_uaddU32 (small)', () => {
    // @ts-ignore
    blackbox(mpzA._uaddU32(c));
  });

  bench('MpZ#__uadd (small)', () => {
    // @ts-ignore
    blackbox(mpzA.__uadd(mpzC));
  });

  bench('MpZ#add (small)', () => {
    blackbox(mpzA.add(mpzC));
  });
  
  bench('BigInt#add (small)', () => {
    blackbox(bigIntA.add(bigIntC));
  });
});