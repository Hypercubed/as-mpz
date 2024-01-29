import { MpZ } from '..';
import { BigInt } from 'as-bigint/assembly/BigInt';

const a = '0xFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAED';
const b = '0x0000DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEAD';
const mpzA = MpZ.from(a);
const mpzB = MpZ.from(b);

const bigIntA = BigInt.from(a);
const bigIntB = BigInt.from(b);

assert(`${mpzA.div(mpzB)}` === `${bigIntA.div(bigIntB)}`);

suite('div large', () => {
  bench('MpZ#_udiv (large)', () => {
    // @ts-ignore
    blackbox(mpzA._udiv(mpzB));
  });

  bench('MpZ#div (large)', () => {
    blackbox(mpzA.div(mpzB));
  });

  bench('BigInt#div (large)', () => {
    blackbox(bigIntA.div(bigIntB));
  });
});

const c = '0xDEAD';
const mpzC = MpZ.from(c);
const bigIntC = BigInt.from(c);

assert(`${mpzA.div(mpzC)}` === `${bigIntA.div(bigIntC)}`);

suite('div small', () => {
  bench('MpZ#_udiv (small)', () => {
    // @ts-ignore
    blackbox(mpzA._udiv(mpzC));
  });

  bench('MpZ#div (small)', () => {
    blackbox(mpzA.div(mpzC));
  });

  bench('BigInt#div (small)', () => {
    blackbox(bigIntA.div(bigIntC));
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

assert(`${f3 / f4}` === `${f1 / f2}`);

suite('mul very large', () => {
  bench('MpZ#mul (very large)', () => {
    blackbox(f1.mul(f2));
  });

  bench('BigInt#mul (very large)', () => {
    blackbox(f3.mul(f4));
  });
});
