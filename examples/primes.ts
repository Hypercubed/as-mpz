import { MpZ } from '../assembly';

const THREE = MpZ.from(3);

// Check if a u64 is prime
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
function millerRabinCheck(n: MpZ, v: MpZ[]): boolean {
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
function millerRabin(n: MpZ, k: u32 = 8): boolean {
  const v = new Array<MpZ>(k);

  for (let i: u32 = 0; i < k; i++) {
    v[i] = MpZ.random(n.size * 32)
      .mod(n.sub(4))
      .add(2); // random (2, n − 2)
  }

  return millerRabinCheck(n, v);
}

// Checks if a MpZ is prime
function isProbablePrime(p: MpZ): boolean {
  if (p.isNeg) return false;
  if (p.size < 3) return isPrime64(p.toU64()); // TODO: compare isPrime64 to millerRabinCheck(<2^64, V) for V = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]

  if (p.mod(MpZ.TWO).eqz()) return false;
  if (p.mod(3).eqz()) return false;
  if (p.mod(5).eqz()) return false;

  return millerRabin(p);
}

primes(58);
console.log();
cuban(43);
console.log();
cullen(2);
console.log();
factorial(14);
console.log();
falsePrimes(2);

function primes(N: u32): void {
  console.log(`Primes (A000040)`);
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

function cuban(N: u32): void {
  console.log(`Cuban Primes (A002407)`);
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

function cullen(N: u32): void {
  console.log(`Cullen Primes (A050920)`);
  console.log(`n\ta(n)`);

  let n: u32 = 1;
  let i = MpZ.ONE;
  while (true) {
    const x = i.mul(MpZ.TWO.pow(i)).inc();
    if (isProbablePrime(x)) {
      console.log(`${n++}\t${x}`);
    }
    i++;
    if (n > N) break;
  }
}

function factorial(N: u32): void {
  console.log(`Factorial primes (A088054)`);
  console.log(`n\ta(n)`);

  console.log(`1\t2`);
  console.log(`2\t3`);

  let n: u32 = 3;

  let i = THREE;
  let x = MpZ.TWO;

  while (true) {
    x = x.mul(i);
    const a = x.dec();
    if (isProbablePrime(a)) {
      console.log(`${n++}\t${a}`);
    }
    const b = x.inc();
    if (isProbablePrime(b)) {
      console.log(`${n++}\t${b}`);
    }
    i++;
    if (n > N) break;
  }
}

function falsePrimes(N: u32): void {
  console.log(`False primes (A014233)`);
  console.log(`n\ta(n)`);

  // V is the list of bases for the Miller-Rabin test for n < 2^64
  const V = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37].map(
    (_: u32): MpZ => MpZ.from(_)
  );
  let v = [MpZ.TWO];

  let n: u32 = 1;
  let i = 3;
  while (true) {
    const isProbablePrime = millerRabinCheck(MpZ.from(i), v);
    if (isProbablePrime && !isPrime64(i)) {
      console.log(`${n++}\t${i}`);
      v = V.slice(0, n);
    }
    // if (!isProbablePrime && isPrime64(i)) {
    //   throw new Error(`False composite: ${i}`);
    // }
    if (n > N) break;
    i++;
    i++;
  }
}
