import { MpZ } from '..';
import { BigInt } from 'as-bigint/assembly/BigInt';

const a = 5;
const b = 3 ** 2;

const mpzA = blackbox(MpZ.from(a));
const bigIntA = blackbox(BigInt.from(a));

const mpzM = blackbox(MpZ.from('100'));

bench('MpZ#pow', () => {
  blackbox(mpzA.pow(b));
});

bench('MpZ#powMod', () => {
  blackbox(mpzA.powMod(b, mpzM));
});

bench('BigInt#pow', () => {
  blackbox(bigIntA.pow(b));
});
