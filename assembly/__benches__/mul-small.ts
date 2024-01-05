import { MpZ } from '..';
import { BigInt } from 'as-bigint/assembly/BigInt';

const a = '0xFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAED';
const b = '0xDEAD';
const mpzA = blackbox(MpZ.from(a));
const mpzB = blackbox(MpZ.from(b));

const bigIntA = blackbox(BigInt.from(a));
const bigIntB = blackbox(BigInt.from(b));

bench('MpZ#mul', () => {
  blackbox(mpzA.mul(mpzB));
});

// bench('MpZ#_umulKaratsuba', () => {
//   // @ts-ignore
//   blackbox(mpzA._umulKaratsuba(mpzB));
// });

bench('BigInt#mul', () => {
  blackbox(bigIntA.mul(bigIntB));
});
