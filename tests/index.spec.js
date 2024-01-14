import { readFileSync } from 'node:fs';
import t from 'tap';
import { instantiate } from '../build/debug.js';
import { toHex, random } from './setup.js';

const wasm = readFileSync('./build/debug.wasm');
const module = await WebAssembly.compile(wasm);

let mpz = await instantiate(module, {});

const N = 100; // number of random iterations
const M = 2 ** 6; // max number of limbs

const toString = (n, base = 10) => mpz.toString(mpz.from(String(n)), base);
const hex = (n) => mpz.toHex(mpz.from(String(n)));

t.beforeEach(async () => {
  const module = await WebAssembly.compile(wasm);
  mpz = await instantiate(module, {});
});

t.test('toString', (t) => {
  t.test('toString(10)', (t) => {
    t.equal(toString('0'), '0');
    t.equal(toString('0xdeadbeef'), '3735928559');

    t.end();
  });

  t.test('toString(16)', (t) => {
    t.equal(toString('0', 16), '0');
    t.equal(toString('0xdeadbeef', 16), 'deadbeef');

    t.end();
  });

  t.test('toString(-16)', (t) => {
    t.equal(toString('0', 16), '0');
    t.equal(toString('0xdeadbeef', -16), 'DEADBEEF');

    t.end();
  });

  t.test('toHex()', (t) => {
    t.equal(hex('0'), '0x0');

    t.equal(hex('3'), '0x3');
    t.equal(hex('0xdeadbeef'), '0xdeadbeef');
    t.equal(hex('3735928559'), '0xdeadbeef');
    t.equal(hex('0xdeadbeefdeadbeef'), '0xdeadbeefdeadbeef');
    t.equal(
      hex('0xdeadbeefdeadbeefdeadbeefdeadbeef'),
      '0xdeadbeefdeadbeefdeadbeefdeadbeef',
    );

    t.equal(hex('-0x3'), '-0x3');
    t.equal(hex('-0xdeadbeef'), '-0xdeadbeef');
    t.equal(hex('-3735928559'), '-0xdeadbeef');
    t.equal(hex('-0xdeadbeefdeadbeef'), '-0xdeadbeefdeadbeef');
    t.equal(
      hex('-0xdeadbeefdeadbeefdeadbeefdeadbeef'),
      '-0xdeadbeefdeadbeefdeadbeefdeadbeef',
    );

    t.equal(
      hex('3735928559373592855937359285593735928559'),
      toHex(3735928559373592855937359285593735928559n),
    );

    t.end();
  });

  t.test('fuzzing', async (t) => {
    for (let i = 1; i < N; i++) {
      const n = random(M);
      t.equal(hex(n), toHex(n));
    }

    // // very large
    // const a = random(2 ** 30);  // upper limit of 2 ** 32 - 1
    // t.equal(hex(a), toHex(a));

    t.end();
  });

  t.end();
});

const cmp = (n, m) => mpz.cmp(mpz.from(String(n)), mpz.from(String(m)));

t.test('cmp', async (t) => {
  t.test('n>0, m>0', (t) => {
    t.equal(cmp('0x0', '0x0'), 0);
    t.equal(cmp('0x3', '0x1'), 1);
    t.equal(cmp('0x1', '0x3'), -1);

    t.equal(cmp('0x3', '0x3'), 0);
    t.equal(cmp('0x3', '0x5'), -1);
    t.equal(cmp('0x5', '0x3'), 1);

    t.equal(cmp('0xdead0000', '0x0000beef'), 1);
    t.equal(cmp('0x0000beef', '0xdead0000'), -1);
    t.end();
  });

  t.test('n<0, m<0', (t) => {
    t.equal(cmp('-0x3', '0x1'), -1);
    t.equal(cmp('-0x1', '0x3'), -1);

    t.equal(cmp('-0x3', '-0x3'), 0);
    t.equal(cmp('-0x3', '-0x5'), 1);
    t.equal(cmp('-0x5', '-0x3'), -1);

    t.equal(cmp('-0xdead0000', '-0x0000beef'), -1);
    t.equal(cmp('-0x0000beef', '-0xdead0000'), 1);

    t.end();
  });

  t.test('n>0, m<0', (t) => {
    t.equal(cmp('0x3', '-0x1'), 1);
    t.equal(cmp('0x1', '-0x3'), 1);

    t.equal(cmp('0x3', '-0x3'), 1);
    t.equal(cmp('0x3', '-0x5'), 1);
    t.equal(cmp('0x5', '-0x3'), 1);

    t.equal(cmp('0xdead0000', '-0x0000beef'), 1);
    t.equal(cmp('0x0000beef', '-0xdead0000'), 1);

    t.end();
  });

  t.test('n<0, m>0', (t) => {
    t.equal(cmp('-0x3', '0x1'), -1);
    t.equal(cmp('-0x1', '0x3'), -1);

    t.equal(cmp('-0x3', '0x3'), -1);
    t.equal(cmp('-0x3', '0x5'), -1);
    t.equal(cmp('-0x5', '0x3'), -1);

    t.equal(cmp('-0xdead0000', '0x0000beef'), -1);
    t.equal(cmp('-0x0000beef', '0xdead0000'), -1);

    t.end();
  });

  t.test('fuzzing', async (t) => {
    for (let i = 0; i < N; i++) {
      const n = random(M);
      const m = random(M);
      t.same(cmp(n, m), n > m ? 1 : n < m ? -1 : 0);
    }
    t.end();
  });
  t.end();
});

const shl = (n, m) => mpz.toHex(mpz.shl(mpz.from(String(n)), m));

t.test('shl', (t) => {
  t.same(shl('0x1', 1), '0x2');
  t.same(shl('0xdeadbeef', 1), '0x1bd5b7dde');
  t.same(shl('0xdeadbeef', 8), '0xdeadbeef00');
  t.same(shl('0xdeadbeef', 32), '0xdeadbeef00000000');
  t.same(shl('0xdeadbeef', 64), '0xdeadbeef0000000000000000');
  t.end();
});

const fact = (n) => mpz.toHex(mpz.fact(n));
const factDiv = (n, m) => mpz.toHex(mpz.div(mpz.fact(n), mpz.fact(m)));

t.test('factorials', (t) => {
  t.same(fact(0), '0x1');
  t.same(fact(10), 3628800);
  t.same(
    fact(100),
    '0x1B30964EC395DC24069528D54BBDA40D16E966EF9A70EB21B5B2943A321CDF10391745570CCA9420C6ECB3B72ED2EE8B02EA2735C61A000000000000000000000000'.toLowerCase(),
  );

  t.same(factDiv('0', '0'), '0x1');
  t.same(factDiv('100', '99'), 100);
  t.same(factDiv('1000', '999'), 1000);

  t.end();
});

t.end();
