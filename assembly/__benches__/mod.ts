import { MpZ } from '..';
import { BigInt } from 'as-bigint/assembly/BigInt';

const a = '542101086242752217003726400434970855712890625'; // 5^4^3
const m = '100000000000000000000';

const mpzA = MpZ.from(a);
const mpzM = MpZ.from(m);

const bigIntA = BigInt.from(a);
const bigIntM = BigInt.from(m);

suite('mod large', () => {
  bench('MpZ#rem (large)', () => {
    blackbox(mpzA.rem(mpzM));
  });

  bench('MpZ#mod (large)', () => {
    blackbox(mpzA.mod(mpzM));
  });

  bench('BigInt#mod (large)', () => {
    blackbox(bigIntA.mod(bigIntM));
  });
});

const c = '100';
const mpzC = MpZ.from(c);
const bigIntC = BigInt.from(c);

suite('mod (small)', () => {
  bench('MpZ#rem (small)', () => {
    blackbox(mpzA.rem(mpzC));
  });

  bench('MpZ#mod (small)', () => {
    blackbox(mpzA.mod(mpzC));
  });

  bench('BigInt#mod (small)', () => {
    blackbox(bigIntA.mod(bigIntC));
  });
});
