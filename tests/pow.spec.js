import t from 'tap';
import {
  mpz,
  to,
  from,
  t_pow,
  t_powMod,
  t_sqrt,
  t_root,
  BigIntMath
} from './setup.js';
import fc from 'fast-check';

fc.configureGlobal({ numRuns: 200 });
const N = 256; // 2**31-1 max

t.test('pow', t => {
  fc.assert(
    fc.property(fc.bigIntN(N), fc.bigInt(0n, 2n ** 4n), (n, m) => {
      t.equal(t_pow(n, m), n ** m);
    }),
    {
      examples: [
        [0n, 0n],
        [1n, 1n],
        [2n, 2n],
        [0xdeadbeefn, 1n]
      ]
    }
  );

  t.end();
});

t.test('powMod', t => {
  fc.assert(
    fc.property(
      fc.bigIntN(N),
      fc.bigInt(0n, 2n ** 8n),
      fc.bigIntN(N),
      (x, n, m) => {
        if (m === 0n) m++;
        t.equal(t_powMod(x, n, m), BigIntMath.mod(x ** n, m));
      }
    )
  );

  t.end();
});

t.test('identites', t => {
  fc.assert(
    fc.property(fc.bigIntN(N), n => {
      t.equal(t_pow(n, 0n), 1n);
      t.equal(t_pow(n, 1n), n);
    })
  );

  // a^*(m + n) = a^m * a^n
  // (a^m)^n = a^(m * n)

  t.end();
});

t.test("Kunth's Test", t => {
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
          1
        ].join('');

        const tm = mpz.sub(mpz.pow(from(b), from(m)), from(1));
        const tn = mpz.sub(mpz.pow(from(b), from(n)), from(1));

        t.equal(to(mpz.mul(tm, tn)), BigInt(r));
      }
    )
  );

  t.end();
});
