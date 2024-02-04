import { MpZ } from '../assembly';

function isPrime32(p: i32): boolean {
  if (p === 2 || p === 3) return true;
  if (p < 1 || p % 2 === 0 || p % 3 === 0) return false;

  for (let i = 5; i * i < p; i += 6) {
    if (p % i === 0 || p % (i + 2) === 0) return false;
  }

  return true;
}

// Lucas-Lehmer primality test for Mersenne numbers
function lucasLehmer(p: i32, Mp: MpZ = MpZ.ONE.mul_pow2(p).dec()): boolean {
  let s = MpZ.from(4).rem(Mp);

  for (let i = 1; i < p - 1; i++) {
    s = s.mul(s).sub(2).rem(Mp);
  }

  return s.eqz();
}

// Mp is a Mersenne number M = 2**p - 1
// If Mp is prime, then (2**p-1) * 2**(p-1) is perfect.

const MAX = 1280; // 1279, 2281, 3217

let u = MpZ.ONE.mul_pow2(1);
for (let p = 2; p < MAX; p++) {
  process.stdout.write(`${p}\r`);

  u = u.mul_pow2(1);
  if (!isPrime32(p)) continue;

  const Mp = u.dec();
  if (p === 2 || lucasLehmer(p, Mp)) {
    const perfect = Mp.mul(u.div_pow2(1));
    console.log(`${p}\t${trim(Mp)}\t${trim(perfect)}`);
  }
}

// Outputs perfect primes < 100: https://en.wikipedia.org/wiki/List_of_Mersenne_primes_and_perfect_numbers

function trim<T>(m: T): string {
  const s = m.toString();
  if (s.length <= 12) return s + ' '.repeat(15 - s.length);
  return s.slice(0, 6) + '...' + s.slice(-6);
}
