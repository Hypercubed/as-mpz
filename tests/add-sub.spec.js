import t from 'tap';
import { mpz, t_add, t_sub } from './setup.js';
import fc from 'fast-check';

fc.configureGlobal({ numRuns: 300 });

t.test('addition', t => {
  fc.assert(
    fc.property(fc.bigIntN(4096), fc.bigIntN(4096), (n, m) => {
      t.equal(t_add(n, m), n + m);
    }),
    {
      examples: [
        // positive
        [0n, 0n],
        [3n, 5n],
        [0xdead0000n, 0x0000beefn],
        [0x00000000deadbeefn, 0xdeadbeef00000000n],
        [0x2950793089775236n, 0x2160715205785584n],
        [0x403105631078710n, 0x3402969886132728n],

        // rhs<0
        [8n, -3n],
        [3n, -8n],
        [0xdeadbeefn, -0x0000beefn],

        // lhs<0, rhs<0
        [-8n, -3n],
        [-3n, -8n],
        [-0xdead0000n, -0x0000beefn]
      ]
    }
  );

  t.end();
});

t.test('subtraction', t => {
  fc.assert(
    fc.property(fc.bigIntN(4096), fc.bigIntN(4096), (n, m) => {
      t.equal(t_sub(n, m), n - m);
    }),
    {
      examples: [
        // lhs>rhs>0
        [8n, 5n],
        [0xdead0000n, 0x0000beefn],
        [0xdeadbeefn, 0xbeefn],
        [0xdeadbeefdeadbeefn, 0xdeadbeef00000000n],
        // rhs>lhs>0
        [5n, 8n],
        // rhs<0, |lhs|>|rhs|
        [8n, -3n],
        [0xdead0000n, -0x0000beefn],
        [2779068574725052n, -2776491312893844n],
        // rhs<0, |rhs|>|lhs|
        [3n, -8n],
        // lhs<rhs<0
        [-8n, -3n],
        [-3n, -8n],
        [-0xdeadbeefn, -0x0000beefn],
        // rhs<lhs<0
        [-3n, -8n]
      ]
    }
  );

  t.end();
});

t.test('invariants', t => {
  fc.assert(
    fc.property(fc.bigIntN(4096), fc.bigIntN(4096), (n, m) => {
      const r = mpz.add(mpz.from(n), mpz.from(m));
      const s = mpz.sub(r, mpz.from(m));
      t.equal(mpz.toHex(r), mpz.toHex(s));
    })
  );

  t.end();
});
