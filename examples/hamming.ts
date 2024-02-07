import { MpZ } from '../assembly';

const h: MpZ[] = [MpZ.ONE];

const TWO = MpZ.from(2);
const THREE = MpZ.from(3);
const FIVE = MpZ.from(5);

let x2 = TWO;
let x3 = THREE;
let x5 = FIVE;

let i = 0;
let j = 0;
let k = 0;

function min(a: MpZ, b: MpZ, c: MpZ): MpZ {
  if (a < b) return a < c ? a : c;
  return b < c ? b : c;
}

function hamming(n: i32): MpZ {
  n--;
  if (n < h.length) return h[n];

  while (h.length < n) {
    h.push(min(x2, x3, x5));

    if (h[h.length - 1] === x2) x2 = h[++i].mul(TWO);
    if (h[h.length - 1] === x3) x3 = h[++j].mul(THREE);
    if (h[h.length - 1] === x5) x5 = h[++k].mul(FIVE);
  }

  return h[h.length - 1];
}

console.log(`n\tH[n]`);

for (let n = 1; n <= 62; n++) {
  console.log(`${n}\t${hamming(n)}`);
}

console.log(`1691\t${hamming(1691)}`);

console.log(`1000000\t${hamming(1_000_000)}`);
