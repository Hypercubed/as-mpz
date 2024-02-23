import { MpZ } from '..';
import { BigInt } from 'as-bigint/assembly/BigInt';

const a = '0xFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAED';
const b = '0xDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF';
const mpzA = MpZ.from(a);
const mpzB = MpZ.from(b);

const bigIntA = BigInt.from(a);
const bigIntB = BigInt.from(b);

suite('sub', () => {
  bench('MpZ#__usub', () => {
    // @ts-ignore
    blackbox(mpzA.__usub(mpzB));
  });

  bench('MpZ#sub', () => {
    blackbox(mpzA.sub(mpzB));
  });

  bench('BigInt#sub', () => {
    blackbox(bigIntA.sub(bigIntB));
  });
});

const c = 0xdead;
const d = 0xbeef;
const mpzC = MpZ.from(c);
const mpzD = MpZ.from(d);
const bigIntC = BigInt.from(c);
const bigIntD = BigInt.from(d);

suite('sub small', () => {
  bench('native', () => {
    blackbox(c - d);
  });

  bench('MpZ#_usubU32 (small)', () => {
    // @ts-ignore
    blackbox(mpzC._usubU32(c));
  });

  bench('MpZ#__usub (small)', () => {
    // @ts-ignore
    blackbox(mpzC.__usub(mpzD));
  });

  bench('MpZ#sub (small)', () => {
    blackbox(mpzC.sub(mpzD));
  });

  bench('BigInt#sub (small)', () => {
    blackbox(bigIntC.sub(bigIntD));
  });
});

const mpzE = MpZ.from(100).fact().sub(1);
const mpzF = MpZ.from(100).fact().sub(100);
const bigIntE = fact(BigInt.from(1), BigInt.from(100)).sub(1);
const bigIntF = fact(BigInt.from(1), BigInt.from(100)).sub(100);

function fact<T>(one: T, n: T): T {
  let a: T = one;
  while (n > one) {
    a *= n;
    n -= one;
  }
  return a;
}

suite('sub (large)', () => {
  bench('MpZ#__usub (large)', () => {
    // @ts-ignore
    blackbox(mpzE.__usub(mpzF));
  });

  bench('MpZ#sub (large)', () => {
    blackbox(mpzE.sub(mpzF));
  });

  bench('BigInt#sub (large)', () => {
    blackbox(bigIntE.sub(bigIntF));
  });
});
