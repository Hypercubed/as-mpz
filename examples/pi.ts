// from http://ajennings.net/blog/a-million-digits-of-pi-in-9-lines-of-javascript.html

import { MpZ } from '../assembly';

const N: u32 = 100_000; // Number of digits to compute (excluding the 3)
const P: u32 = 2 * u32(Math.log10(N)); // Adding a few extra digits to avoid rounding errors to N places

const M = MpZ.from(10).pow(N + P);

let start = process.hrtime();

let x = MpZ.from(3).mul(M);
let pi = x; // pi = PI*10^N
let i: u32 = 1;
while (!x.eqz()) {
  x = x.mul(i).div(++i * 4);
  pi += x.div(++i);
}

let end = process.hrtime();
const elapsedTime = (f32(end - start) / 1e9).toString().slice(0, 5);

start = process.hrtime();
const s = pi.toString();
end = process.hrtime();
const convertTime = (f32(end - start) / 1e9).toString().slice(0, 5);

console.log(`Digits: ${N}`);
console.log(`Final Limb Size: ${pi.size}`);
console.log(`Elapsed: ${elapsedTime}s`);
console.log(`String conversion: ${convertTime}s`);

const n = 50; // Digits to display
console.log(`3.${s.slice(1, n + 1)}...${s.slice(N - n + 1, N + 1)}`);
