import t from 'tap';
import { mpz, to, from, t_add, t_sub, t_inc, t_dec } from './setup.js';
import fc from 'fast-check';

fc.configureGlobal({ numRuns: 20 });

const N = 4096; // 2**32-1 max

t.test('addition', t => {
  fc.assert(
    fc.property(fc.bigIntN(N), fc.bigIntN(N), (n, m) => {
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

t.test('inc', t => {
  fc.assert(
    fc.property(fc.bigIntN(N), n => {
      t.equal(t_inc(n), n + 1n);
    }),
    {
      examples: [[0n], [-1n], [1n]]
    }
  );

  t.end();
});

t.test('subtraction', t => {
  fc.assert(
    fc.property(fc.bigIntN(N), fc.bigIntN(N), (n, m) => {
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

t.test('dec', t => {
  fc.assert(
    fc.property(fc.bigIntN(N), n => {
      t.equal(t_dec(n), n - 1n);
    }),
    {
      examples: [[0n], [-1n], [1n]]
    }
  );

  t.end();
});

t.test('invariants', t => {
  fc.assert(
    fc.property(fc.bigIntN(N), n => {
      // -(-n) = n
      t.equal(to(mpz.negate(mpz.negate(from(n)))), n);

      // identity
      t.equal(t_add(n, 0n), n);
      t.equal(t_add(0n, n), n);
      t.equal(t_sub(n, 0n), n);
      t.equal(t_sub(0n, n), -n);
    })
  );

  fc.assert(
    fc.property(fc.bigIntN(N), fc.bigIntN(N), (n, m) => {
      // (n+m)-m = n
      t.equal(to(mpz.sub(mpz.add(from(n), from(m)), from(m))), n);

      // commutative
      t.equal(t_add(n, m), t_add(m, n));
      t.equal(t_sub(n, m), t_add(n, -m));
    })
  );

  fc.assert(
    fc.property(fc.bigIntN(N), fc.bigIntN(N), fc.bigIntN(N), (a, b, c) => {
      const A = from(a);
      const B = from(b);
      const C = from(c);

      // associative
      // (a+b)+c = a+(b+c)
      t.equal(to(mpz.add(mpz.add(A, B), C)), to(mpz.add(A, mpz.add(B, C))));
      // (a-b)-c = a-(b+c)
      t.equal(to(mpz.sub(mpz.sub(A, B), C)), to(mpz.sub(A, mpz.add(B, C))));
      // (a+b)-c = a+(b-c)
      t.equal(to(mpz.sub(mpz.add(A, B), C)), to(mpz.add(A, mpz.sub(B, C))));
    })
  );

  t.end();
});

t.end();
