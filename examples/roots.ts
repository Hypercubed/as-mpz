import { MpZ } from '../assembly';

console.log(`square root of 2 = ${MpZ.from(2).isqrt()}`);

console.log(`3rd root of 7 = ${MpZ.from(7).iroot(3)}`);
console.log(`3rd root of 8 = ${MpZ.from(8).iroot(3)}`);
console.log(`3rd root of 9 = ${MpZ.from(9).iroot(3)}`);

const b = MpZ.from(100).pow(2000).mul(2);
console.log(`First 2001 digits of the square root of 2 = ${b.isqrt()}`);
