import { MpZ } from '../assembly';

function isPrime32(p: i32): boolean {
  if (p === 2 || p === 3) return true;
  if (p < 1 || p % 2 === 0 || p % 3 === 0) return false;

  // const max = u32(Math.floor(Math.sqrt(p)));

  for (let i = 5; i * i < p; i += 6) {
    if (p % i === 0 || p % (i + 2) === 0) return false;
  }

  return true;
}

// Lucas-Lehmer primality test
function lucasLehmer(p: i32, Mp: MpZ = MpZ.ONE.shl(p).sub(1)): boolean {
  let s = MpZ.from(4).rem(Mp);

  for (let i = 1; i < p - 1; i++) {
    s = s.mul(s).sub(2).rem(Mp);
  }

  return s.eqz();
}

// Mp is a Mersenne number M = 2**p - 1
// If Mp is prime, then (2**p-1) * 2**(p-1) is perfect.

let u = MpZ.ONE.shl(1);
for (let p = 2; p < 1500; p++) {
  u = u.shl(1);
  if (p > 3 && !isPrime32(p)) continue;

  const Mp = u.sub(1);
  if (p === 2 || lucasLehmer(p, Mp)) {
    const perfect = Mp.mul(u.shr(1));
    console.log(`${p} : ${trim(Mp)} : ${trim(perfect)}`);
  }
}

// Outputs perfect primes < 100: https://en.wikipedia.org/wiki/List_of_Mersenne_primes_and_perfect_numbers

function trim(m: MpZ): string {
  const s = m.toString();
  return s.length > 12 ? (s.slice(0, 6) + '...' + s.slice(-6)) : s;
}
