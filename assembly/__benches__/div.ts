import { MpZ } from '..';
import { BigInt } from 'as-bigint/assembly/BigInt';

const a = '0xFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAED';
const b = '0x0000DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEAD';
const mpzA = blackbox(MpZ.from(a));
const mpzB = blackbox(MpZ.from(b));

const bigIntA = blackbox(BigInt.from(a));
const bigIntB = blackbox(BigInt.from(b));

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
const mpzC = blackbox(MpZ.from(c));
const bigIntC = blackbox(BigInt.from(c));

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

