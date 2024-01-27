import t from 'tap';
import { mpz, t_mul, t_div } from './setup.js';
import fc from 'fast-check';

fc.configureGlobal({ numRuns: 300 });

const N = 2 ** 12; // 2**31-1 max

t.test('multiplication', t => {
  fc.assert(
    fc.property(fc.bigIntN(N), fc.bigIntN(N), (n, m) => {
      t.equal(t_mul(n, m), n * m);
    }),
    {
      examples: [
        // positive
        [0n, 0n],
        [1n, 1n],
        [0x10n, 0x10n],
        [0xdead0000n, 0x0000beefn],
        [0xffffn, 0xffffn],
        [0xffffffffn, 0xffffffffn],
        [
          0x2e75f2aa067132a276c13262e7268d7cecc8190a00000n,
          0x35f29e388c20bfbac4964bfba000n
        ],

        // n<0, m<0
        [-0x10n, -0x10n],
        [-0xffffn, -0xffffn],
        [-0xffffffffn, -0xffffffffn],

        // n>0, m<0
        [0x10n, -0x10n],
        [0xffffn, -0xffffn],
        [0xffffffffn, -0xffffffffn],

        // n<0, m>0
        [-0x10n, 0x10n],
        [-0xffffn, 0xffffn],
        [-0xffffffffn, 0xffffffffn]
      ]
    }
  );

  t.end();
});

t.test('division', t => {
  fc.assert(
    fc.property(fc.bigIntN(N), fc.bigIntN(N), (n, m) => {
      m = m || 1n;
      t.equal(t_div(n, m), n / m);
    }),
    {
      examples: [
        // S(m)=1
        [1n, 1n],
        [2n, 1n],
        [4n, 1n],

        // n<m
        [2n, 4n],
        [0xffffffffffffffffn, 0xfffffffffffffffffn],

        // n=m
        [2n, 2n],
        [0xffffffffffffffffn, 0xffffffffffffffffn],

        // 1<m<0xFFFFFFFF, 1<n<0xFFFFFFFF
        [2n, 2n],
        [4n, 2n],
        [8n, 2n],
        [0xbeefn, 16n],
        [0x1000n, 0x10n],
        [0x10000000n, 0x10n],
        [0xdeadbeefn, 16n],
        [0xdeadbeefn, 0x100n],
        [0xdeadbeefn, 0x10000000n],
        [0xffffffffn, 0xfn],
        [0xffffffffn, 0xffffffffn],
        [0xffffffffn, 0xfffffffn],

        // n>0xFFFFFFFF, 1<m<0xFFFFFFFF
        [0xdeadbeefdeadbeefn, 1n],
        [0xdeadbeefdeadbeefn, 0x10n],
        [0xdeadbeefdeadbeefn, 0x100n],
        [0xffffffffffffffffn, 0xfn],
        [0xffffffffffffffffn, 0xffffffffn],
        [0xffffffffffffffffn, 0xfffffffn],

        // n>m>0xFFFFFFFF
        [0xffffffffffffffffn, 0xfffffffffffffffn],
        [0xffffffffffffffffn, 0xfffffffffffffn],
        [0xffffffffffffffffffffn, 0xfffffffffffffffffffn],
        [0xffffffffffffffffffffn, 0xfffffffffffffffffn],
        [0xdeadbeefdeadbeef00000000n, 0xdeadbeefdeadbeef0000n],

        // Special Cases
        [34125305527818743474129076526n, 9580783237862390338n], // requires two D3 correction steps
        [0x100229888f0870594265f617feeb3bb879c7d35ecd04fn, 2n ** 89n - 1n], // Requires D6 correction step
        [
          0x3ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff80000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffn,
          2n ** 521n - 1n
        ]
      ]
    }
  );

  t.end();
});

t.test('mul-div invariants', t => {
  fc.assert(
    fc.property(fc.bigIntN(N), fc.bigIntN(N), (_n, _d) => {
      const n = mpz.from(_n);
      const d = mpz.from(_d || 1n);

      const q = mpz.div(n, d);
      const m = mpz.rem(n, d);
      const r = mpz.add(mpz.mul(q, d), m);
      t.equal(mpz.toHex(r), mpz.toHex(n));
    })
  );

  t.end();
});
