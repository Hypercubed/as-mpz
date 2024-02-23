import { MpZ } from '../assembly';

let fl!: MpZ;
let fn!: MpZ;

// Lucas sequences of the first kind
const U = (P: i32, Q: i32): void => run(MpZ.ZERO, MpZ.ONE, P, Q);

// Lucas sequences of the second kind
const V = (P: i32, Q: i32): void => run(MpZ.TWO, MpZ.from(P), P, Q);

console.log('Fibonacci numbers (A000045)');
console.log(`n\ta(n)`);
U(1, -1);

console.log(``);
console.log('Lucas numbers (A000032)');
console.log(`n\ta(n)`);
V(1, -1);

console.log(``);
console.log('Pell numbers (A000129)');
console.log(`n\ta(n)`);
U(2, -1);

console.log(``);
console.log('Pell-Lucas numbers (A002203)');
console.log(`n\ta(n)`);
V(2, -1);

console.log(``);
console.log('Jacobsthal numbers (A001045)');
console.log(`n\ta(n)`);
U(1, -2);

console.log(``);
console.log('Jacobsthal-Lucas numbers (A014551)');
console.log(`n\ta(n)`);
V(1, -2);

console.log(``);
console.log('Mersenne numbers (A000225)');
console.log(`n\ta(n)`);
U(3, 2);

// **********************************************

function next(P: i32, Q: i32): void {
  const f = fn.mul(P).sub(fl.mul(Q));
  fl = fn;
  fn = f;
}

function run(f0: MpZ, f1: MpZ, P: i32, Q: i32): void {
  fl = f0;
  fn = f1;

  console.log(`0\t${fl}`);
  console.log(`1\t${fn}`);

  let n = 2;
  while (n <= 40) {
    next(P, Q);
    console.log(`${n}\t${trim(fn)}`);
    ++n;
  }

  while (n <= 1000) {
    next(P, Q);
    if (n % 100 === 0) console.log(`${n}\t${trim(fn)}`);
    ++n;
  }

  while (n <= 10000) {
    next(P, Q);
    if (n % 1000 === 0) console.log(`${n}\t${trim(fn)}`);
    ++n;
  }
}

function trim<T>(m: T, n: u32 = 30): string {
  const s = m.toString();
  if (s.length <= 2 * n) return s + ' '.repeat(2 * n + 3 - s.length);
  return s.slice(0, n) + '...' + s.slice(-n);
}