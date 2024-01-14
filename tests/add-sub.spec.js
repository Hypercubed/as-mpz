import { readFileSync } from 'node:fs';
import t from 'tap';
import { instantiate } from '../build/debug.js';
import { toHex, random } from './setup.js';

const wasm = readFileSync('./build/debug.wasm');
const module = await WebAssembly.compile(wasm);

let mpz = await instantiate(module, {});

const N = 1000; // number of random iterations
const M = 2 ** 7; // max number of limbs

t.beforeEach(async () => {
  const module = await WebAssembly.compile(wasm);
  mpz = await instantiate(module, {});
});

const add = (n, m) => mpz.toHex(mpz.add(mpz.from(n), mpz.from(m)));

t.test('addition', (t) => {
  t.test('positive', (t) => {
    t.same(add(0, 0), 0);
    t.same(add('0x3', '0x5'), 8);
    t.same(add('0xdead0000', '0x0000beef'), 0xdeadbeef);
    t.same(
      add('0x00000000deadbeef', '0xdeadbeef00000000'),
      0xdeadbeefdeadbeefn,
    );

    t.same(add('2950793089775236', '2160715205785584'), 0x1228e3c4392e74n);
    t.same(add('403105631078710', '3402969886132728'), 3806075517211438n);
    t.end();
  });

  t.test('negitive (rhs<0)', (t) => {
    t.same(add('0x8', '-0x3'), 5);
    t.same(add('0x3', '-0x8'), '-0x5');
    t.same(add('0xdeadbeef', '-0x0000beef'), 0xdead0000);
    t.end();
  });

  t.test('negitive (lhs<0, rhs<0)', (t) => {
    t.same(add('-0x8', '-0x3'), '-0xb');
    t.same(add('-0x3', '-0x8'), '-0xb');
    t.same(add('-0xdead0000', '-0x0000beef'), '-0xdeadbeef');
    t.end();
  });

  t.test('fuzzing', async (t) => {
    for (let i = 0; i < N; i++) {
      const n = random(M);
      const m = random(M);
      t.same(add(String(n), String(m)), toHex(n + m));
    }

    // very large
    const a = random(2 ** 12);
    const b = random(2 ** 12);
    t.same(add(String(a), String(b)), toHex(a + b));

    t.end();
  });

  t.end();
});

const sub = (n, m) => mpz.toHex(mpz.sub(mpz.from(n), mpz.from(m)));

t.test('subtraction', (t) => {
  t.test('lhs>rhs>0', (t) => {
    t.same(sub('0x8', '0x5'), 0x3);
    t.same(sub('0xdead0000', '0x0000beef'), 0xdeac4111);
    t.same(sub('0xdeadbeef', '0xbeef'), 0xdead0000);
    t.same(sub('0xdeadbeefdeadbeef', '0xdeadbeef00000000'), 0xdeadbeefn);
    t.end();
  });

  t.test('rhs>lhs>0)', (t) => {
    t.same(sub('0x5', '0x8'), '-0x3');
    t.end();
  });

  t.test('rhs<0, |lhs|>|rhs|', (t) => {
    t.same(sub('0x8', '-0x3'), '0xb');
    t.same(sub('0xdead0000', '-0x0000beef'), 0xdeadbeef);
    t.same(sub('2779068574725052', '-2776491312893844'), 0x13bcc095a14350n);
    t.end();
  });

  t.test('rhs<0, |rhs|>|lhs|', (t) => {
    t.same(sub('0x3', '-0x8'), '0xb');
    t.end();
  });

  t.test('lhs<rhs<0', (t) => {
    t.same(sub('-0x8', '-0x3'), '-0x5');
    t.same(sub('-0x3', '-0x8'), '0x5');
    t.same(sub('-0xdeadbeef', '-0x0000beef'), '-0xdead0000');
    t.end();
  });

  t.test('rhs<lhs<0', (t) => {
    t.same(sub('-0x3', '-0x8'), '0x5');
    t.end();
  });

  t.test('fuzzing', async (t) => {
    for (let i = 0; i < N; i++) {
      const n = random(M);
      const m = random(M);
      t.same(sub(String(n), String(m)), toHex(n - m));
    }
    t.end();
  });

  t.end();
});
