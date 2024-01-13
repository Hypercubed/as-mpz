import { MpZ } from '..';
import { BigInt } from 'as-bigint/assembly/BigInt';

const a =
  '0xFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAED';
const mpzA = blackbox(MpZ.from(a));
const bigIntA = blackbox(BigInt.from(a));

suite('sqr', () => {
  bench('MpZ#mul', () => {
    blackbox(mpzA.mul(mpzA));
  });

  bench('MpZ#_usqr', () => {
    // @ts-ignore
    blackbox(mpzA._usqr());
  });

  bench('MpZ#pow2', () => {
    blackbox(mpzA.pow(2));
  });

  bench('BigInt#mul', () => {
    blackbox(bigIntA.mul(bigIntA));
  });

  bench('BigInt#pow2', () => {
    blackbox(bigIntA.pow(2));
  });

  bench('BigInt#square', () => {
    blackbox(bigIntA.square());
  });
});
