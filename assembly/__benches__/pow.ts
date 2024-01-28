import { MpZ } from '..';
import { BigInt } from 'as-bigint/assembly/BigInt';

const a = 5;
const b = 3 ** 2;

const mpzA = MpZ.from(a);
const mpzB = MpZ.from(b);
const bigIntA = BigInt.from(a);

suite('pow', () => {
  bench('MpZ#_upowU32', () => {
    // @ts-ignore
    blackbox(mpzA._upowU32(b));
  });

  bench('MpZ#_upow', () => {
    // @ts-ignore
    blackbox(mpzA._upow(mpzB));
  });

  bench('MpZ#pow', () => {
    blackbox(mpzA.pow(b));
  });

  bench('BigInt#pow', () => {
    blackbox(bigIntA.pow(b));
  });
});
