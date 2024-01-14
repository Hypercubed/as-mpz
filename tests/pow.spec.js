import t from 'tap';
import { mpz, to, from, t_pow, random } from './setup.js';

const N = 500; // number of random iterations
const M = 2 ** 7; // number of limbs

t.test('pow', (t) => {
  t.equal(t_pow(1, 1), 1n);
  t.equal(t_pow(1, 2), 1n);
  t.equal(t_pow(2, 2), 4n);
  t.equal(t_pow('0xdeadbeef', 1), 0xdeadbeefn);

  t.test('fuzzing', async (t) => {
    for (let i = 0; i < 100; i++) {
      const n = random(3);

      let r = from(1);

      for (let j = 1; j < 20; j++) {
        r = mpz.mul(r, from(n));

        t.equal(t_pow(n, j), to(r));
        t.equal(t_pow(n, j), n ** BigInt(j));
      }
    }
    t.end();
  });

  t.end();
});

t.test("Kunth's Test", (t) => {
  const b = 10;
  const bm1 = `9`;
  const bm2 = `8`;

  for (let i = 0; i < N; i++) {
    const m = ((Math.random(M) * 2 ** 8) | 0) + 1;
    const n = ((Math.random(M) * 2 ** 8) | 0) + m + 1;

    const r = [
      bm1.repeat(m - 1),
      bm2,
      bm1.repeat(n - m),
      '0'.repeat(m - 1),
      1,
    ].join('');

    const tm = mpz.sub(mpz.pow(from(b), from(m)), from(1));
    const tn = mpz.sub(mpz.pow(from(b), from(n)), from(1));

    t.equal(to(mpz.mul(tm, tn)), BigInt(r));
  }

  t.end();
});
