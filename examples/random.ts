import { MpZ } from '../assembly';

let u: u64 = 0; // N+
let v: u64 = 0; // N-

let N: u64 = 0; // N

let c = 0; // last value
let r = 0; // runs

while (true) {
  const B = u32(Math.floor(4096 * Math.random()) + 1);
  const l = MpZ.random(B);
  const z = MpZ.random(B);
  if (z === l) continue;

  const x = z > l;

  if (x) u++;
  if (!x) v++;
  N++;

  if (x !== c) {
    r++;
    c = x;
  }

  if (N % 10000 === 0) {
    const a = f64(u) / f64(N);
    const b = f64(v) / f64(N);

    const as = toFixed(a * 100, 2);
    const bs = toFixed(b * 100, 2);

    const E: f64 = f64(N) / 2;

    const V: f64 = ((f64(u) - E) ** 2 + (f64(v) - E) ** 2) / E;

    const uv2: f64 = 2.0 * f64(u) * f64(v);
    const mean: f64 = uv2 / f64(N) + 1.0; // expected number of runs E(R)
    const ss: f64 = ((mean - 1.0) * (mean - 2.0)) / (f64(N) - 1.0);
    const z: f64 = Math.abs((r - mean) / Math.sqrt(ss)); // z statistic

    console.log(
      `${N}\t\tN+: ${as}, N-: ${bs}\t(χ2 = ${toFixed(V, 4)}, |Z| = ${toFixed(
        f64(z),
        4
      )})`
    );
  }
}

function toFixed(n: f64, d: i32): string {
  const s = n.toString();
  const i = s.indexOf('.');
  return s.slice(0, i + d + 1);
}
