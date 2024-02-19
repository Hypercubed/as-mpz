import { MpZ } from '../assembly';

const THREE = MpZ.from(3);

// Check if a u64 is prime using trial division
function isPrime64(p: u64): boolean {
  if (p === 2 || p === 3) return true;
  if (p < 1 || p % 2 === 0 || p % 3 === 0) return false;

  for (let i: u64 = 5; i * i <= p; i += 6) {
    if (p % i === 0 || p % (i + 2) === 0) return false;
  }

  return true;
}

// Deterministic Miller-Rabin primality test
// Returns true if n is probably prime, false if it's definitely composite
function millerTest(n: MpZ, v: MpZ[]): boolean {
  const nm1 = n.dec();

  let s: u32 = 0; // ctz(n - 1)
  let d = nm1;
  while (d.mod(MpZ.TWO).eqz()) {
    s++;
    d = d.shiftRight(1); // d = d / 2
  }

  assert(
    MpZ.TWO.pow(s).mul(d).eq(nm1),
    '_uitoaDecimal: assertion failed: MpZ.TWO.pow(s).mul(d).eq(nm1)'
  );

  let k = v.length;
  while (k-- > 0) {
    const a = v[k];

    let x = a.powMod(d, n);

    let i = s;
    while (i-- > 0) {
      const y = x.mul(x).mod(n);
      if (y.eq(MpZ.ONE) && !x.eq(MpZ.ONE) && !x.eq(nm1)) return false;
      x = y;
    }
    if (!x.eq(MpZ.ONE)) return false;
  }

  return true;
}

// Non-deterministic Miller-Rabin primality test
// Returns true if n is probably prime, false if it's definitely composite
function millerRabinRandom(n: MpZ, k: u32 = 8): boolean {
  const v = new Array<MpZ>(k);

  for (let i: u32 = 0; i < k; i++) {
    v[i] = MpZ.random(n.size * 32)
      .mod(n.sub(4))
      .add(2); // random (2, n − 2)
  }

  return millerTest(n, v);
}

// V is the list of bases for the Miller-Rabin test for n < 2^64
const V8 = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37].map(
  (n: u32): MpZ => MpZ.from(n)
);

const V1 = V8.slice(0, 1);
const V2 = V8.slice(0, 2);
const V3 = V8.slice(0, 3);
const V4 = V8.slice(0, 4);
const V5 = V8.slice(0, 5);
const V6 = V8.slice(0, 6);
const V7 = V8.slice(0, 7);

// for n.size < 2 returns Deterministic Miller-Rabin primality test
// for n.size > 2 returns Non-deterministic Miller-Rabin primality test with k trials
// Returns true if n is probably prime, false if it's definitely composite
function millerRabin(n: MpZ, k: u32 = 8): boolean {
  if (n.lt(2047)) return millerTest(n, V1);
  if (n.lt(1373653)) return millerTest(n, V2);
  if (n.lt(25326001)) return millerTest(n, V3);
  if (n.lt(3215031751)) return millerTest(n, V4);
  if (n.lt(2152302898747)) return millerTest(n, V5);
  if (n.lt(3474749660383)) return millerTest(n, V6);
  if (n.lt(341550071728321)) return millerTest(n, V7);
  if (n.lt('3825123056546413051')) return millerTest(n, V8);
  if (n.size < 2) return millerTest(n, V8);
  return millerRabinRandom(n, k);
}

// Checks if a MpZ is probable prime
function isProbablePrime(p: MpZ): boolean {
  if (p.isNeg) return false;
  if (p.eq(MpZ.TWO) || p.eq(THREE)) return true;
  if (p.le(MpZ.ONE) || p.isEven()) return false;

  return millerRabin(p, 8);
}

function nextProbablePrime(p: MpZ): MpZ {
  if (p.isNeg) return MpZ.ZERO;
  if (p.lt(MpZ.TWO)) return MpZ.TWO;
  if (p.eq(MpZ.TWO)) return THREE;
  if (p.isEven()) p = p.inc();
  while (!isProbablePrime(p)) {
    p = p.add(2);
  }
  return p;
}

console.log(`The prime numbers (A000040)`);
primes(58);
console.log();

console.log(`Cuban Primes (A002407)`);
cuban(43);
console.log();

console.log(`Cullen Primes (A050920)`);
cullen(2);
console.log();

console.log(`Factorial primes (A088054)`);
factorial(14);
console.log();

// // console.log(`False primes (A014233)`);
// // falsePrimes(13); // too slow
// // console.log();

console.log(`Strong pseudoprimes to base 2 (A001262)`);
pseudoPrimes(32, 2);
console.log();

console.log(`Strong pseudoprimes to base 3 (A020229)`);
pseudoPrimes(34, 3);
console.log();

console.log('Difference between first prime > 10^n and 10^n (A033873)');
primeDistance(69);
console.log();

// Generate the first N primes
function primes(N: u32): void {
  console.log(`n\ta(n)`);

  let n: u32 = 1;
  let i = MpZ.TWO;
  while (true) {
    if (isProbablePrime(i)) {
      console.log(`${n++}\t${i}`);
    }
    i++;
    if (n > N) break;
  }
}

// Generate the first N cuban primes
function cuban(N: u32): void {
  console.log(`n\ta(n)`);

  let n: u32 = 1;
  let y = MpZ.ONE;
  while (true) {
    const x = y.inc();
    const i = (x.pow(3) - y.pow(3)) / (x - y);
    if (isProbablePrime(i)) {
      console.log(`${n++}\t${i}`);
    }
    y++;
    if (n > N) break;
  }
}

// Generate the first N cullen primes
function cullen(N: u32): void {
  console.log(`n\ta(n)`);

  let n: u32 = 1;
  let i = MpZ.ONE;
  let j = MpZ.ONE; // 2^i
  while (true) {
    j = j.mul(2);
    const x = i.mul(j).inc(); // i * 2^i + 1
    if (isProbablePrime(x)) {
      console.log(`${n++}\t${x}`);
    }
    i++;
    if (n > N) break;
  }
}

// Generate the first N factorial primes
function factorial(N: u32): void {
  console.log(`n\ta(n)`);

  console.log(`1\t2`);
  console.log(`2\t3`);

  let n: u32 = 3;

  let i = THREE;
  let x = MpZ.TWO;

  while (true) {
    x = x.mul(i); // x = x * i = x!
    const a = x.dec(); // x! - 1
    if (isProbablePrime(a)) {
      console.log(`${n++}\t${a}`);
    }
    const b = x.inc(); // x! + 1
    if (isProbablePrime(b)) {
      console.log(`${n++}\t${b}`);
    }
    i++;
    if (n > N) break;
  }
}

// Smallest odd number for which Miller-Rabin primality test on bases <= n-th prime does not reveal compositeness.
function falsePrimes(N: u32): void {
  console.log(`n\ta(n)`);

  let v = [MpZ.TWO];

  let n: u32 = 1;
  let i = 3;
  while (true) {
    const isProbablePrime = millerTest(MpZ.from(i), v);
    if (isProbablePrime && !isPrime64(i)) {
      console.log(`${n++}\t${i}`);
      v = V8.slice(0, n);
    }
    if (!isProbablePrime && isPrime64(i)) {
      throw new Error(`False composite: ${i}`);
    }
    if (n > N) break;
    i++;
    i++;
  }
}

// Strong pseudoprimes to base M.
function pseudoPrimes(N: u32, M: u32): void {
  console.log(`n\ta(n)`);

  const v = [MpZ.from(M)];

  let n: u32 = 1;
  let i = 5;
  while (true) {
    const isProbablePrime = millerTest(MpZ.from(i), v);
    if (isProbablePrime && !isPrime64(i)) {
      console.log(`${n++}\t${i}`);
    }
    if (!isProbablePrime && isPrime64(i)) {
      throw new Error(`False composite: ${i}`);
    }
    if (n > N) break;
    i++;
    i++;
  }
}

function primeDistance(N: u32): void {
  console.log(`n\ta(n)`);

  let n: u32 = 0;
  let i = MpZ.ONE;
  while (true) {
    const p = nextProbablePrime(i);
    console.log(`${n++}\t${p - i}`);
    if (n > N) break;
    i = i.mul(10);
  }
}
