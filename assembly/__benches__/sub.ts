import { MpZ } from '..';
import { BigInt } from 'as-bigint/assembly/BigInt';

const a = '0xFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAED';
const b = '0xDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF';
const mpzA = blackbox(MpZ.from(a));
const mpzB = blackbox(MpZ.from(b));

const bigIntA = blackbox(BigInt.from(a));
const bigIntB = blackbox(BigInt.from(b));

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
const mpzC = blackbox(MpZ.from(c));
const bigIntC = blackbox(BigInt.from(c));

suite('sub small', () => {
  bench('MpZ#__usub32 (small)', () => {
    // @ts-ignore
    blackbox(mpzA.__usub32(c));
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
