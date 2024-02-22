import { MpZ } from '../assembly';

console.log('Factorial numbers');
console.log(`n\tn!`);

let n = 0;
while (n < 25) {
  console.log(`${n}\t${MpZ.from(n).fact()}`);
  ++n;
}

while (n <= 150) {
  console.log(`${n}\t${MpZ.from(n).fact().valueOf()}`);
  n += 25;
}

// Check if a u64 is prime using trial division
function isPrime64(p: MpZ): boolean {
  if (p.eq(2) || p.eq(3)) return true;
  if (p.lt(1) || p.mod(2).eqz() || p.mod(3).eqz()) return false;

  for (let i = MpZ.from(5); i * i <= p; i = i.add(6)) {
    if (p.mod(i).eqz() || p.mod(i.add(2)).eqz()) return false;
  }

  return true;
}

function primorial(n: MpZ): MpZ {
  let p = MpZ.TWO;
  let result = MpZ.ONE;
  while (p.le(n)) {
    if (isPrime64(p)) {
      result = result.mul(p);
    }
    p = p.add(MpZ.ONE);
  }
  return result;
}

console.log(``);
console.log('Primorial numbers');
console.log(`n\tpn#`);

n = 0;
let i = MpZ.ONE;
while (n <= 40) {
  if (isPrime64(i)) {
    console.log(`${n++}\t${primorial(i)}`);
  }
  i++;
}

function subfactorial(n: MpZ): MpZ {
  if (n.eq(0)) return MpZ.ONE;
  if (n.eq(1)) return MpZ.ZERO;
  return n.sub(1).mul(subfactorial(n.sub(1)).add(subfactorial(n.sub(2))));
}

console.log(``);
console.log('Subfactorial numbers');
console.log(`n\t!n`);

n = 0;
while (n <= 23) {
  console.log(`${n}\t${subfactorial(MpZ.from(n))}`);
  n++;
}

function superfactorial(n: MpZ): MpZ {
  if (n.eq(0)) return MpZ.ONE;
  return n.fact().mul(superfactorial(n.sub(1)));
}

console.log(``);
console.log('Superfactorial numbers');
console.log(`n\ta(n)`);

n = 0;
while (n <= 13) {
  console.log(`${n}\t${superfactorial(MpZ.from(n))}`);
  n++;
}

function exponentialFactorial(n: MpZ): MpZ {
  if (n.eq(1)) return MpZ.ONE;
  return n.pow(exponentialFactorial(n.sub(1)));
}

console.log(``);
console.log('Exponential factorial numbers');
console.log(`n\ta(n)`);

n = 1;
while (n <= 5) {
  console.log(`${n}\t${trim(exponentialFactorial(MpZ.from(n)))}`);
  n++;
}

function trim<T>(m: T, n: u32 = 10): string {
  const s = m.toString();
  if (s.length <= 2 * n) return s + ' '.repeat(2 * n + 3 - s.length);
  return s.slice(0, n) + '...' + s.slice(-n);
}
