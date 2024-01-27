import t from 'tap';
import {
  t_mul_pow2,
  t_div_pow2,
  t_shr,
  t_shl,
  t_and,
  t_or,
  t_xor,
  t_not
} from './setup.js';
import fc from 'fast-check';

fc.configureGlobal({ numRuns: 100 });

t.test('mul_pow2', t => {
  fc.assert(
    fc.property(
      fc.bigIntN(4096),
      fc.bigInt({ min: 0n, max: 2n ** 16n }),
      (n, m) => {
        t.equal(t_mul_pow2(n, m), n * 2n ** m);
      }
    ),
    {
      examples: [
        [-1n, 1n],
        [1n, 1n],
        [0xdeadbeefn, 1n],
        [0xdeadbeefn, 8n],
        [0xdeadbeefn, 32n],
        [0xdeadbeefn, 64n],
        [-0xdeadbeefn, 64n]
      ]
    }
  );

  t.end();
});

t.test('div_pow2', t => {
  fc.assert(
    fc.property(
      fc.bigIntN(4096),
      fc.bigInt({ min: 0n, max: 2n ** 16n }),
      (n, m) => {
        t.equal(t_div_pow2(n, m), n / 2n ** m);
      }
    ),
    {
      examples: [
        [-1n, 1n],
        [1n, 1n],
        [0xdeadbeefn, 1n],
        [0xdeadbeefn, 8n],
        [0xdeadbeefn, 32n],
        [0xdeadbeefn, 64n],
        [-0xdeadbeefn, 64n]
      ]
    }
  );

  t.end();
});

t.test('<<', t => {
  fc.assert(
    fc.property(fc.bigIntN(4096), fc.bigIntN(15), (n, m) => {
      t.equal(t_shl(n, m), n << m);
    }),
    {
      examples: [
        [1n, -1n],
        [-1n, 1n],
        [1n, 1n],
        [-1n, -1n],
        [0xdeadbeefn, 1n],
        [0xdeadbeefn, 8n],
        [0xdeadbeefn, 32n],
        [0xdeadbeefn, 64n],
        [-0xdeadbeefn, 64n]
      ]
    }
  );

  t.end();
});

t.test('>>', t => {
  fc.assert(
    fc.property(fc.bigIntN(4096), fc.bigIntN(15), (n, m) => {
      t.equal(t_shr(n, m), n >> m);
    }),
    {
      examples: [
        [1n, -1n],
        [-1n, 1n],
        [1n, 1n],
        [-1n, -1n],
        [0xdeadbeefn, 1n],
        [0xdeadbeefn, 8n],
        [0xdeadbeefn, 32n],
        [0xdeadbeefn, 64n],
        [-0xdeadbeefn, 64n]
      ]
    }
  );

  t.end();
});

t.test('and', t => {
  fc.assert(
    fc.property(fc.bigIntN(4096), fc.bigIntN(4096), (n, m) => {
      t.equal(t_and(n, m), n & m);
    })
  );

  t.end();
});

t.test('or', t => {
  fc.assert(
    fc.property(fc.bigIntN(4096), fc.bigIntN(4096), (n, m) => {
      t.equal(t_or(n, m), n | m);
    })
  );

  t.end();
});

t.test('xor', t => {
  fc.assert(
    fc.property(fc.bigIntN(4096), fc.bigIntN(4096), (n, m) => {
      t.equal(t_xor(n, m), n ^ m);
    })
  );

  t.end();
});

t.test('not', t => {
  fc.assert(
    fc.property(fc.bigIntN(4096), n => {
      t.equal(t_not(n), ~n);
    })
  );

  t.end();
});

t.end();
