import { MpZ } from '..';
import { BigInt } from 'as-bigint/assembly/BigInt';

const a = '542101086242752217003726400434970855712890625'; // 5^4^3
const m = '100';

const mpzA = blackbox(MpZ.from(a));
const mpzM = blackbox(MpZ.from(m));

const bigIntA = blackbox(BigInt.from(a));
const bigIntM = blackbox(BigInt.from(m));

bench('MpZ#mod', () => {
  blackbox(mpzA.mod(mpzM));
});

bench('MpZ#_umod', () => {
  // @ts-ignore
  blackbox(mpzA._umod(mpzM));
});

// bench('MpZ#_umodNewtonInv', () => {
//   blackbox(mpzA._umodNewtonInv(mpzM));
// });

bench('BigInt#mod', () => {
  blackbox(bigIntA.mod(bigIntM));
});
