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

export const from = n => mpz.from(String(n));
export const to = n => BigInt(mpz.toString(n));
export const t_add = (n, m) => to(mpz.add(from(n), from(m)));
export const t_sub = (n, m) => to(mpz.sub(from(n), from(m)));
export const t_mul = (n, m) => to(mpz.mul(from(n), from(m)));
export const t_div = (n, m) => to(mpz.div(from(n), from(m)));
export const t_pow = (n, m) => to(mpz.pow(from(n), from(m)));
export const t_rem = (n, m) => to(mpz.rem(from(n), from(m)));
export const t_mod = (n, m) => to(mpz.mod(from(n), from(m)));

export const t_mul_pow2 = (n, m) => to(mpz.mul_pow2(from(n), m));
export const t_div_pow2 = (n, m) => to(mpz.div_pow2(from(n), m));

export const t_shr = (n, m) => to(mpz.shr(from(n), from(m)));
export const t_shl = (n, m) => to(mpz.shl(from(n), from(m)));

export const t_and_op = (n, m) => to(mpz.and_op(from(n), from(m)));
export const t_or_op = (n, m) => to(mpz.or_op(from(n), from(m)));
export const t_xor_op = (n, m) => to(mpz.xor_op(from(n), from(m)));
export const t_not = n => to(mpz.not(from(n)));

export const t_cmp = (n, m) => mpz.cmp(from(n), from(m));

export const t_fact = n => to(mpz.fact(n));

export const t_string = (n, base = 10) => mpz.toString(from(n), base);
export const t_hex = n => mpz.toHex(from(n));
