import t from 'tap';
import { mpz, to, from, t_pow } from './setup.js';
import fc from 'fast-check';

fc.configureGlobal({ numRuns: 300 });

t.test('pow', (t) => {
  fc.assert(
    fc.property(fc.bigIntN(256), fc.bigInt(0n, 20n), (n, m) => {
      t.equal(t_pow(n, m), n ** m);
    }),
    {
      examples: [
        [0n, 0n],
        [1n, 1n],
        [2n, 2n],
        [0xdeadbeefn, 1n],
      ],
    },
  );

  t.end();
});

t.test("Kunth's Test", (t) => {
  const b = 10;
  const bm1 = `9`;
  const bm2 = `8`;

  fc.assert(
    fc.property(
      fc.integer({ min: 2, max: 8 }),
      fc.integer({ min: 1, max: 8 }),
      (n, m) => {
        n = n + m; // n > m

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
      },
    ),
  );

  t.end();
});
