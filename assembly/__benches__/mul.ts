import { MpZ } from '..';
import { BigInt } from 'as-bigint/assembly/BigInt';

const a = '0xFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAED';
const b = '0xDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF';

const mpzA = MpZ.from(a);
const mpzB = MpZ.from(b);

const bigIntA = BigInt.from(a);
const bigIntB = BigInt.from(b);

assert(`${mpzA.mul(mpzB)}` === `${bigIntA.mul(bigIntB)}`);

suite('mul large', () => {
  bench('MpZ#mul (large)', () => {
    blackbox(mpzA.mul(mpzB));
  });

  bench('BigInt#mul (large)', () => {
    blackbox(bigIntA.mul(bigIntB));
  });
});

const c = '0xDEAD';
const mpzC = MpZ.from(c);
const bigIntC = BigInt.from(c);

assert(`${mpzA.mul(mpzC)}` === `${bigIntA.mul(bigIntC)}`);

suite('mul small', () => {
  bench('MpZ#mul (small)', () => {
    blackbox(mpzA.mul(mpzC));
  });

  bench('BigInt#mul (small)', () => {
    blackbox(bigIntA.mul(bigIntC));
  });
});

function fact<T>(one: T, n: T): T {
  let a = one;
  while (n > one) {
    a *= n;
    n -= one;
  }
  return a;
}

const f1 = fact<MpZ>(MpZ.from(1), MpZ.from(1000));
const f2 = fact<MpZ>(MpZ.from(1), MpZ.from(500));

const f3 = fact(BigInt.from(1), BigInt.from(1000));
const f4 = fact(BigInt.from(1), BigInt.from(500));

assert(`${f3 * f4}` === `${f1 * f2}`);

suite('mul very large', () => {
  bench('MpZ#mul (very large)', () => {
    blackbox(f1.mul(f2));
  });

  bench('BigInt#mul (very large)', () => {
    blackbox(f3.mul(f4));
  });
});
