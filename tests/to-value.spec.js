import t from 'tap';
import {
  t_value,
  t_u32,
  t_i32,
  t_u64,
  t_i64,
  t_asIntN,
  t_asUintN
} from './setup.js';
import fc from 'fast-check';

fc.configureGlobal({ numRuns: 200 });
const N = 4096; // 2**31-1 max

t.test('toValue', t => {
  fc.assert(
    fc.property(fc.bigIntN(N), n => {
      t.equal(t_value(n), Number(n));
    }),
    {
      examples: [[0n], [1n], [0xffffffffn], [0xffffffffffffffffn]]
    }
  );

  t.end();
});

t.test('toU32', t => {
  fc.assert(
    fc.property(fc.bigIntN(N), n => {
      t.equal(t_u32(n), BigInt.asUintN(32, n));
    }),
    {
      examples: [
        [0n],
        [1n],
        [0xffffn],
        [0xffffffffn],
        [0xffffffffffffffffn],
        [-0xffffn],
        [-0xffffffffn],
        [-0xffffffffffffffffn]
      ]
    }
  );

  t.end();
});

t.test('toI32', t => {
  fc.assert(
    fc.property(fc.bigIntN(N), n => {
      t.equal(t_i32(n), BigInt.asIntN(32, n));
    }),
    {
      examples: [
        [0n],
        [1n],
        [0xffffn],
        [0xffffffffn],
        [0xffffffffffffffffn],
        [0xffffffffffff1234n],
        [-0xffffn],
        [-0xffffffffn],
        [-0xffffffffffffffffn],
        [-0xffffffffffff1234n]
      ]
    }
  );

  t.end();
});

t.test('toU64', t => {
  fc.assert(
    fc.property(fc.bigIntN(N), n => {
      t.equal(t_u64(n), BigInt.asUintN(64, n));
    })
  );

  t.end();
});

t.test('toI64', t => {
  fc.assert(
    fc.property(fc.bigIntN(N), n => {
      t.equal(t_i64(n), BigInt.asIntN(64, n));
    })
  );

  t.end();
});

t.test('asUintN', t => {
  fc.assert(
    fc.property(fc.bigIntN(N), fc.integer({ min: 0, max: N }), (n, m) => {
      // t.equal(t_asUintN(m, n), n & ((1n << BigInt(m)) - 1n));
      // t.equal(t_asUintN(m, n), mod(n, 1n << BigInt(m)));
      t.equal(t_asUintN(m, n), BigInt.asUintN(m, n));
    }),
    {
      examples: [
        [0n, 0],
        [1n, 0],
        [-1n, 0],
        [1n, 1],
        [-1n, 1]
      ]
    }
  );

  t.end();
});

t.test('asIntN', t => {
  fc.assert(
    fc.property(fc.bigIntN(N), fc.integer({ min: 0, max: N }), (n, m) => {
      t.equal(t_asIntN(m, n), BigInt.asIntN(m, n));
    }),
    {
      examples: [
        [0n, 0],
        [1n, 0],
        [-1n, 0],
        [1n, 1],
        [-1n, 1]
      ]
    }
  );

  t.end();
});
