import { MpZ } from '..';
import { BigInt } from 'as-bigint/assembly/BigInt';

const a = '0xFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAED';
const b = 0xbeef;
const mpzA = blackbox(MpZ.from(a));
const mpzB = blackbox(MpZ.from(b));

const bigIntA = blackbox(BigInt.from(a));
const bigIntB = blackbox(BigInt.from(b));

bench('MpZ#add', () => {
  blackbox(mpzA.add(mpzB));
});

bench('MpZ#__uadd', () => {
  // @ts-ignore
  blackbox(mpzA.__uadd(mpzB));
});

bench('MpZ#_uaddU32', () => {
  // @ts-ignore
  blackbox(mpzA._uaddU32(b));
});

bench('BigInt#add', () => {
  blackbox(bigIntA.add(bigIntB));
});
