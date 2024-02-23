import { MpZ } from '..';
import { BigInt } from 'as-bigint/assembly/BigInt';

const a: u32 = 5;
const b: u32 = 9;

const mpzA = MpZ.from(a);
const mpzB = MpZ.from(b);
const bigIntA = BigInt.from(a);

suite('pow (small)', () => {
  bench('native', () => {
    blackbox(a ** b);
  });

  bench('MpZ#_upowU32', () => {
    // @ts-ignore
    blackbox(mpzA._upowU32(b));
  });

  bench('MpZ#_upowLarge', () => {
    // @ts-ignore
    blackbox(mpzA._upowLarge(mpzB));
  });

  bench('MpZ#pow', () => {
    blackbox(mpzA.pow(b));
  });

  bench('BigInt#pow', () => {
    blackbox(bigIntA.pow(b));
  });
});

const mpzD = MpZ.from(2).shiftLeft(1234);

suite('pow powerOf2', () => {
  bench('MpZ#_upow powerOf2', () => {
    // @ts-ignore
    blackbox(mpzD._upow(mpzB));
  });

  bench('MpZ#_upowU32 powerOf2', () => {
    // @ts-ignore
    blackbox(mpzD._upowU32(b));
  });

  bench('MpZ#_upowLarge powerOf2', () => {
    // @ts-ignore
    blackbox(mpzD._upowLarge(mpzB));
  });

  bench('MpZ#pow', () => {
    blackbox(mpzD.pow(mpzB));
  });
});

function fact<T>(one: T, n: T): T {
  let a: T = one;
  while (n > one) {
    a *= n;
    n -= one;
  }
  return a;
}

const mpzC = MpZ.from(100).fact().sub(1);
const bigIntC = fact(BigInt.from(1), BigInt.from(100)).sub(1);

suite('pow (large)', () => {
  bench('MpZ#pow (large)', () => {
    blackbox(mpzC.pow(9));
  });

  bench('BigInt#pow (large)', () => {
    blackbox(bigIntC.pow(9));
  });
});
