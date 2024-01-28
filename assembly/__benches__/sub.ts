import { MpZ } from '..';
import { BigInt } from 'as-bigint/assembly/BigInt';

const a = '0xFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAED';
const b = '0xDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF';
const mpzA = MpZ.from(a);
const mpzB = MpZ.from(b);

const bigIntA = BigInt.from(a);
const bigIntB = BigInt.from(b);

suite('sub large', () => {
  bench('MpZ#__usub (large)', () => {
    // @ts-ignore
    blackbox(mpzA.__usub(mpzB));
  });

  bench('MpZ#sub (large)', () => {
    blackbox(mpzA.sub(mpzB));
  });

  bench('BigInt#sub (large)', () => {
    blackbox(bigIntA.sub(bigIntB));
  });
});

const c = 0xdead;
const mpzC = MpZ.from(c);
const bigIntC = BigInt.from(c);

suite('sub small', () => {
  bench('MpZ#_usubFromU32 (small)', () => {
    // @ts-ignore
    blackbox(mpzA._usubFromU32(c));
  });

  bench('MpZ#__usub (small)', () => {
    // @ts-ignore
    blackbox(mpzA.__usub(mpzC));
  });

  bench('MpZ#sub (small)', () => {
    blackbox(mpzA.sub(mpzC));
  });

  bench('BigInt#sub (small)', () => {
    blackbox(bigIntA.sub(bigIntC));
  });
});
