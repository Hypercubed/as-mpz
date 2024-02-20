import { MpZ } from '../assembly';

function knuth_arrow(k: MpZ, n: MpZ, b: MpZ): MpZ {
  if (b.eqz()) return MpZ.ONE;
  if (n.eq(1)) return k.pow(b);
  return knuth_arrow(k, n.dec(), knuth_arrow(k, n, b.dec()));
}

function ack(m: MpZ, n: MpZ): MpZ {
  if (m.eqz()) return n.inc(); // A(0, n) = n + 1

  // Optimizations for m = 1..3
  // required A(4, 1), A(5, 0), and A(4, 2) without call stack exhausted
  if (m.eq(1)) return n.add(2); // A(1, n) = n + 2
  if (m.eq(2)) return n.mul(2).add(3); // A(2, n) = 2n + 3
  if (m.eq(3)) return MpZ.TWO.pow(n).dec().mul(8).add(5); // A(3, n) = 2^(n+3) - 3

  // // Optional optimizations for m = 4..6 using Knuth's up-arrow notation
  // if (m.eq(4)) return knuth_arrow(MpZ.TWO, MpZ.TWO, n.add(3)).sub(3);  // A(4, n) = 2↑↑(n+3) - 3
  // if (m.eq(5)) return knuth_arrow(MpZ.TWO, MpZ.from(3), n.add(3)).sub(3); // A(5, n) = 2↑↑↑(n+3) - 3
  // if (m.eq(6)) return knuth_arrow(MpZ.TWO, MpZ.from(4), n.add(3)).sub(3); // A(6, n) = 2↑↑↑↑(n+3) - 3

  if (n.eqz()) return ack(m.dec(), MpZ.ONE); // A(m, 0) = A(m-1, 1)
  return ack(m.dec(), ack(m, n.dec())); // A(m, n) = A(m-1, A(m, n-1))
}

console.log('Ackermann function');

for (let m: u32 = 0; m < 6; m++) {
  const N: u32 = m < 4 ? 10 : m < 5 ? 3 : 1;
  for (let n: u32 = 0; n < N; n++) {
    console.log(`A(${m}, ${n}) = ${trim(ack(MpZ.from(m), MpZ.from(n)))}`);
  }
}

console.log();
console.log(`Knuth's up-arrow/Hyperfunctions`);

// prettier-ignore
const K = [
  // tetration
  [2, 1, 1], [2, 1, 2], [2, 1, 3], [2, 1, 4], [2, 1, 5], [2, 1, 6],
  [2, 2, 1], [2, 2, 2], [2, 2, 3], [2, 2, 4], [2, 2, 5],
  [2, 3, 1], [2, 3, 2], [2, 3, 3], // [2, 3, 4],
  [2, 4, 1], [2, 4, 2],
  
  // pentation
  [3, 1, 1], [3, 1, 2], [3, 1, 3], [3, 1, 4], [3, 1, 5],
  [3, 2, 1], [3, 2, 2], [3, 2, 3], // [3, 2, 4],
  [3, 3, 1], [3, 3, 2],
  [3, 4, 1],

  // 4↑n b
  [4, 1, 1], [4, 1, 2], [4, 1, 3], [4, 1, 4], [4, 1, 5],
  [4, 2, 1], [4, 2, 2], [4, 2, 3],
  [4, 3, 1],
  [4, 4, 1],
  
  // 10↑n b
  [10, 1, 1], [10, 1, 2], [10, 1, 3], [10, 1, 4], [10, 1, 5],
  [10, 2, 1], [10, 2, 2],
  [10, 3, 1],
  [10, 4, 1],
]

for (let i: i32 = 0; i < K.length; i++) {
  const k = K[i][0];
  const n = K[i][1];
  const b = K[i][2];
  const s = `${k}↑[${n}]${b}`;
  console.log(
    `${s} = ${trim(knuth_arrow(MpZ.from(k), MpZ.from(n), MpZ.from(b)))}`
  );
}

function trim<T>(m: T, n: u32 = 6): string {
  const s = m.toString();
  if (s.length <= 2 * n) return s + ' '.repeat(2 * n + 3 - s.length);
  return s.slice(0, n) + '...' + s.slice(-n);
}
