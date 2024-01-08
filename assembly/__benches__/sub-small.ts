import { MpZ } from '..';
import { BigInt } from 'as-bigint/assembly/BigInt';

const a = '0xFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAED';
const b = 0xdead;
const mpzA = blackbox(MpZ.from(a));
const mpzB = blackbox(MpZ.from(b));

const bigIntA = blackbox(BigInt.from(a));
const bigIntB = blackbox(BigInt.from(b));

bench('MpZ#sub', () => {
  blackbox(mpzA.sub(mpzB));
});

bench('MpZ#__usub', () => {
  // @ts-ignore
  blackbox(mpzA.__usub(mpzB));
});

bench('MpZ#__usub32', () => {
  // @ts-ignore
  blackbox(mpzA.__usub32(b));
});

bench('BigInt#sub', () => {
  blackbox(bigIntA.sub(bigIntB));
});
