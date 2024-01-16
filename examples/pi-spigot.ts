import { MpZ } from '../assembly';

let q = MpZ.ONE;
let r = MpZ.from(180);
let t = MpZ.from(60);
let n = 2;

step();
process.stdout.write(`3.`);

let i = 0;
while (true) {
  const y = step();
  i++;

  process.stdout.write(`${y.toString()}`);

  if (i % 10 === 0) {
    process.stdout.write(` `);

    if (i % 50 === 0) {
      process.stdout.write(`  : ${i} \n  `);

      if (i % 500 === 0) {
        process.stdout.write(`\n  `);
      }
    }
  }
}

// Gosper’s series Spigot algorithm
function step(): MpZ {
  const y = (q.mul(27 * n - 12) + r.mul(5)) / t.mul(5);
  const u = MpZ.from(9 * n + 3).mul(3 * n + 2);
  r = u.mul(10) * (q.mul(5 * n - 2) + r - y * t);
  q *= MpZ.from(2 * n - 1).mul(10 * n);
  t *= u;
  n++;
  return y;
}
