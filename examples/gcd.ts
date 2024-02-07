import { MpZ } from '../assembly';

console.log(`${MpZ.from(0).gcd(0)}`); // 0
console.log(`${MpZ.from(0).gcd(10)}`); // 10
console.log(`${MpZ.from(0).gcd(-10)}`); // 10
console.log(`${MpZ.from(9).gcd(6)}`); // 3
console.log(`${MpZ.from(6).gcd(9)}`); // 3
console.log(`${MpZ.from(-6).gcd(9)}`); // 3
console.log(`${MpZ.from(8).gcd(45)}`); // 1
console.log(`${MpZ.from(48).gcd(18)}`); // 6
console.log(`${MpZ.from(40902).gcd(24140)}`); // 34

console.log(`${MpZ.from(1_234_567).gcd(9_876_543)}`); // 1
console.log(`${MpZ.from(1234567890).gcd(987654321)}`); // 9
console.log(`${MpZ.from('1234567890987654321').gcd('9876543211234567890')}`); // 9
