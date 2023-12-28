import { MpZ } from '..';
import { BigInt } from 'as-bigint/assembly/BigInt';

const a = '0xFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAED';
const b = '0xDEAD';
const mpzA = blackbox(MpZ.from(a));
const mpzB = blackbox(MpZ.from(b));

const bigIntA = blackbox(BigInt.from(a));
const bigIntB = blackbox(BigInt.from(b));

bench('MpZ#div', () => {
  blackbox(mpzA.div(mpzB));
});

bench('MpZ#_udiv', () => {
  // @ts-ignore
  blackbox(mpzA._udiv(mpzB));
});

// bench('MpZ#_udivNewtonInv', () => {
//   blackbox(mpzA._udivNewtonInv(mpzB));
// });

bench('BigInt#div', () => {
  blackbox(bigIntA.div(bigIntB));
});
