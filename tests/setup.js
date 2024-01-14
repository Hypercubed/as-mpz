import { readFileSync } from 'node:fs';
import t from 'tap';
import { instantiate } from '../build/debug.js';

const wasm = readFileSync('./build/debug.wasm');
const module = await WebAssembly.compile(wasm);

export let mpz = await instantiate(module, {});

t.beforeEach(async () => {
  const module = await WebAssembly.compile(wasm);
  mpz = await instantiate(module, {});
});

export function toHex(a) {
  if (typeof a !== 'string') a = a.toString(16);

  if (a.startsWith('-')) {
    return '-0x' + a.slice(1);
  }
  return '0x' + a;
}

export function randomUint32() {
  return (Math.random() * 2 ** 32) >>> 0;
}

export function randomSigned(limbs) {
  const sign = Math.random() > 0.5 ? 1 : -1;
  const n = new Uint32Array(limbs).reduce((a, _, k) => {
    const p = 2n ** BigInt(k * 32);
    const l = BigInt(randomUint32());
    return a + l * p;
  }, 0n);
  return n * BigInt(sign);
}

export function random(M = 2 ** 6) {
  const r = Math.random();
  if (r < 0.3) return randomSigned(1); // 30% chance of 1 limb
  if (r < 0.6) return randomSigned(2); // 30% chance of 2 limbs
  const limbs = Math.floor(Math.random() * (M - 2)) + 2; // 40% chance of 3-64 limbs
  return randomSigned(limbs);
}

export const from = (n) => mpz.from(String(n));
export const to = (n) => BigInt(mpz.toString(n));
export const t_add = (n, m) => to(mpz.add(from(n), from(m)));
export const t_sub = (n, m) => to(mpz.sub(from(n), from(m)));
export const t_mul = (n, m) => to(mpz.mul(from(n), from(m)));
export const t_div = (n, m) => to(mpz.div(from(n), from(m)));
export const t_pow = (n, m) => to(mpz.pow(from(n), from(m)));
export const t_rem = (n, m) => to(mpz.rem(from(n), from(m)));
export const t_mod = (n, m) => to(mpz.mod(from(n), from(m)));
export const t_shl = (n, m) => to(mpz.shl(from(n), m));
export const t_cmp = (n, m) => mpz.cmp(from(n), from(m));

export const t_fact = (n) => to(mpz.fact(n));
export const t_factDiv = (n, m) => to(mpz.div(mpz.fact(n), mpz.fact(m)));

export const t_string = (n, base = 10) => mpz.toString(from(n), base);
export const t_hex = (n) => mpz.toHex(from(n));
