import t from 'tap';
import { t_mul_pow2, t_div_pow2, t_shr, t_shl } from './setup.js';
import fc from 'fast-check';

fc.configureGlobal({ numRuns: 200 });

const shift = (n, m) => {
  return n < 0n ? -(-n >> BigInt(m)) : n >> BigInt(m);
};

const examples = [
  // [1n, -1n],
  // [-1n, 1n],
  // [1n, 1n],
  // [-1n, -1n],
  [0xdeadbeefn, 1],
  [0xdeadbeefn, 8],
  [0xdeadbeefn, 32],
  [0xdeadbeefn, 64],
  [-0xdeadbeefn, 64]
];

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

t.end();
