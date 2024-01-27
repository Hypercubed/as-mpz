import t from 'tap';
import { t_value, t_u32, t_i32, t_u64, t_i64 } from './setup.js';
import fc from 'fast-check';

fc.configureGlobal({ numRuns: 100 });
const N = 2 ** 12; // 2**31-1 max

t.test('toValue', t => {
  t.equal(t_value('0'), 0);
  t.equal(t_value('1'), 1);
  t.equal(t_value('0xffffffff'), Number(0xffffffffn));
  t.equal(t_value('0xffffffffffffffff'), Number(0xffffffffffffffffn));

  fc.assert(
    fc.property(fc.bigIntN(N), n => {
      t.equal(t_value(n), Number(n));
    })
  );

  t.end();
});

t.test('toU32', t => {
  t.equal(t_u32('0xffff'), 0xffffn);
  t.equal(t_u32('0xffffffff'), 0xffffffffn);
  t.equal(t_u32('0xffffffffffffffff'), 0xffffffffn);

  t.equal(t_u32('-0xffff'), 0xffff0001n);
  t.equal(t_u32('-0xffffffff'), 1n);
  t.equal(t_u32('-0xffffffffffffffff'), 1n);

  fc.assert(
    fc.property(fc.bigIntN(N), n => {
      t.equal(t_u32(n), BigInt.asUintN(32, n));
    })
  );

  t.end();
});

t.test('toI32', t => {
  t.equal(t_i32('0xffff'), 0xffffn);
  t.equal(t_i32('0xffffffff'), -1n);
  t.equal(t_i32('0xffffffffffffffff'), -1n);
  t.equal(t_i32('0xffffffffffff1234'), -60876n);

  t.equal(t_i32('-0xffff'), -0xffffn);
  t.equal(t_i32('-0xffffffff'), 1n);
  t.equal(t_i32('-0xffffffffffffffff'), 1n);
  t.equal(t_i32('-0xffffffffffff1234'), 60876n);

  fc.assert(
    fc.property(fc.bigIntN(N), n => {
      t.equal(t_i32(n), BigInt.asIntN(32, n));
    })
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
