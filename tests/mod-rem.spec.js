import { readFileSync } from 'node:fs';
import t from 'tap';
import { instantiate } from '../build/debug.js';
import { toHex, random } from './setup.js';

const wasm = readFileSync('./build/debug.wasm');
const module = await WebAssembly.compile(wasm);

let mpz = await instantiate(module, {});

const N = 500; // number of random iterations
const M = 2 ** 8; // max number of limbs

const rem = (n, m) => mpz.toHex(mpz.rem(mpz.from(n), mpz.from(m)));
const mod = (n, m) => mpz.toHex(mpz.mod(mpz.from(n), mpz.from(m)));

t.beforeEach(async () => {
  const module = await WebAssembly.compile(wasm);
  mpz = await instantiate(module, {});
});

t.test('rem', (t) => {
  t.same(rem('10000', '7'), 4);
  t.same(rem('-10000', '7'), '-0x4');
  t.same(rem('10000', '-7'), 4);
  t.same(rem('-10000', '-7'), '-0x4');

  t.test('fuzzing', async (t) => {
    for (let i = 0; i < N; i++) {
      const n = random(M);
      const m = random(M) || 1n;
      t.same(rem(String(n), String(m)), toHex(n % m));
    }
    t.end();
  });

  t.end();
});

t.test('modulo', (t) => {
  t.same(mod('10000', '7'), 4);
  t.same(mod('-10000', '7'), 3);
  t.same(mod('10000', '-7'), '-0x3');
  t.same(mod('-10000', '-7'), '-0x4');

  t.end();
});
