import { MpZ } from '..';
import { BigInt } from 'as-bigint/assembly/BigInt';

const s = '0xDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF';
const mpz = blackbox(MpZ.from(s));
const bigInt = blackbox(BigInt.from(s));

suite('to string', () => {
  bench('MpZ#toHex', () => {
    blackbox(mpz.toHex());
  });

  bench('MpZ#toDecimal', () => {
    blackbox(mpz.toDecimal());
  });
  
  bench('BigInt#toString()', () => {
    blackbox(bigInt.toString());
  });
  
  bench('BigInt#toString(16)', () => {
    blackbox(bigInt.toString(16));
  });
});

