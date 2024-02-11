import { MpZ } from '../assembly';

let cn = MpZ.from(1); // c0
let n: u64 = 1;

function nextCatalan(): void {
  n += 1;
  cn = cn
    .mul(2)
    .mul(2 * n - 1)
    .div(n + 1);
}

console.log('na(n)');
console.log(`${n}\t${cn}`);

while (n < 30) {
  nextCatalan();
  console.log(`${n}\t${cn}`);
}

// while (n <= 100_000) {
while (true) {
  nextCatalan();
  const S = u64(Math.log10(f64(n)));
  const M = 10 ** S;
  if (n % M == 0) {
    console.log(`${n}\t${cn.toExponential(14)}`);
  }
}
