import { MpZ } from '..';
import { BigInt } from 'as-bigint/assembly/BigInt';

const s = '0xDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF';
const mpz = MpZ.from(s);
const bigInt = BigInt.from(s);

assert(`${mpz}` === `${bigInt}`);

// suite('to string', () => {
//   bench('MpZ#toHex', () => {
//     blackbox(mpz.toHex());
//   });

//   bench('MpZ#toDecimal', () => {
//     blackbox(mpz.toDecimal());
//   });

//   bench('BigInt#toString()', () => {
//     blackbox(bigInt.toString());
//   });

//   bench('BigInt#toString(16)', () => {
//     blackbox(bigInt.toString(16));
//   });
// });

function fact<T>(one: T, n: T): T {
  let a = one;
  while (n > one) {
    a *= n;
    n -= one;
  }
  return a;
}

const f1 = fact<MpZ>(MpZ.from(1), MpZ.from(1001));
const f2 = fact(BigInt.from(1), BigInt.from(1001));

assert(`${f1}` === `${f2}`);

suite('to string (large)', () => {
  bench('MpZ#toHex (large)', () => {
    blackbox(f1.toHex());
  });

  bench('MpZ#toDecimal (large)', () => {
    blackbox(f1.toDecimal());
  });

  // bench('BigInt#toString() (large)', () => {
  //   blackbox(f2.toString());
  // });

  // bench('BigInt#toString(16) (large)', () => {
  //   blackbox(f2.toString(16));
  // });
});
