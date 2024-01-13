import { MpZ } from '..';
import { BigInt } from 'as-bigint/assembly/BigInt';

const a = '0xFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAED';
const b = '0xDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF';
const mpzA = blackbox(MpZ.from(a));
const mpzB = blackbox(MpZ.from(b));

const bigIntA = blackbox(BigInt.from(a));
const bigIntB = blackbox(BigInt.from(b));

suite('mul large', () => {
  bench('MpZ#mul (large)', () => {
    blackbox(mpzA.mul(mpzB));
  });

  bench('BigInt#mul (large)', () => {
    blackbox(bigIntA.mul(bigIntB));
  });
});

const c = '0xDEAD';
const mpzC = blackbox(MpZ.from(c));
const bigIntC = blackbox(BigInt.from(c));

suite('mul small', () => {
  bench('MpZ#mul (small)', () => {
    blackbox(mpzA.mul(mpzC));
  });

  bench('BigInt#mul (small)', () => {
    blackbox(bigIntA.mul(bigIntC));
  });
});
