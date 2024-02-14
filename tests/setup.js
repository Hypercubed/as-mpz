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

export const BigIntMath = {
  toHex(a) {
    const s = a.toString(16);

    if (s.startsWith('-')) {
      return '-0x' + s.slice(1);
    }
    return '0x' + s;
  },
  abs(x) {
    return x < 0n ? -x : x;
  },
  toPrecision(n, precision) {
    const s = n.toString();
    const e = s.length;
    if (e > precision) {
      const m = 10n ** BigInt(e - precision);
      return ((n + m / 2n) / m) * m;
    }
    return n;
  },
  sign(x) {
    return x < 0n ? -1n : 1n;
  },
  mod(n, m) {
    return ((n % m) + m) % m;
  },
  sqrt(n) {
    return BigInt(Math.pow(Number(n), 1 / 2) | 0);
  },
  root(n, m) {
    return BigInt(
      (Math.sign(Number(n)) * Math.pow(Math.abs(Number(n)), 1 / m)) | 0
    );
  },
  log(k, n) {
    return BigInt(n.toString(k).length - 1);
  },
  gcd(a, b) {
    if (a < 0n) a = -a;
    if (b < 0n) b = -b;

    if (!b) return a;
    return BigIntMath.gcd(b, a % b);
  },
  lcm(a, b) {
    if (a === 0n || b === 0n) return 0n;
    if (a < 0n) a = -a;
    if (b < 0n) b = -b;

    return (a * b) / BigIntMath.gcd(a, b);
  },
  fact(n) {
    if (n < 2n) return 1n;
    var fact = 1n;
    for (let i = 2n; i <= n; i++) {
      fact *= i;
    }
    return fact;
  },
  cmp(a, b) {
    return a === b ? 0 : a < b ? -1 : 1;
  },
  toExponential(n, fractionDigits = 0) {
    if (BigIntMath.abs(n) < Number.MAX_SAFE_INTEGER && fractionDigits <= 100) {
      return Number(n).toExponential(fractionDigits);
    }

    if (fractionDigits <= 20) {
      return n
        .toLocaleString('en-US', {
          notation: 'scientific',
          minimumFractionDigits: fractionDigits,
          maximumFractionDigits: fractionDigits
        })
        .replace(/E/, 'e+');
    }

    // Handle zero and negative values
    const sign = n < 0n ? '-' : '';
    n = BigIntMath.toPrecision(BigIntMath.abs(n), fractionDigits + 1);

    // Determine the exponent based on the number of digits
    const bigintStr = n.toString();
    const exponent = bigintStr.length - 1;

    // Extract the first digit(s) for the significand
    const significand = bigintStr.slice(0, 1);
    const fractionalDigits = bigintStr
      .slice(1, fractionDigits + 1)
      .padEnd(fractionDigits, '0');

    // Construct the exponential notation string
    return `${sign}${significand}.${fractionalDigits}e+${exponent}`;
  }
};

export const from = n => mpz.from(String(n));
export const to = n => BigInt(mpz.toString(n));
export const t_add = (n, m) => to(mpz.add(from(n), from(m)));
export const t_inc = n => to(mpz.inc(from(n)));
export const t_sub = (n, m) => to(mpz.sub(from(n), from(m)));
export const t_dec = n => to(mpz.dec(from(n)));
export const t_mul = (n, m) => to(mpz.mul(from(n), from(m)));
export const t_div = (n, m) => to(mpz.div(from(n), from(m)));
export const t_pow = (n, m) => to(mpz.pow(from(n), from(m)));
export const t_sqrt = n => to(mpz.isqrt(from(n)));
export const t_log2 = n => to(mpz.log2(from(n)));
export const t_log10 = n => to(mpz.log10(from(n)));
export const t_root = (n, m) => to(mpz.iroot(from(n), m));
export const t_rem = (n, m) => to(mpz.rem(from(n), from(m)));
export const t_mod = (n, m) => to(mpz.mod(from(n), from(m)));
export const t_neg = n => to(mpz.negate(from(n)));

export const t_mul_pow2 = (n, m) => to(mpz.mul_pow2(from(n), m));
export const t_div_pow2 = (n, m) => to(mpz.div_pow2(from(n), m));

export const t_shr = (n, m) => to(mpz.shr(from(n), from(m)));
export const t_shl = (n, m) => to(mpz.shl(from(n), from(m)));

export const t_and = (n, m) => to(mpz.and(from(n), from(m)));
export const t_or = (n, m) => to(mpz.or(from(n), from(m)));
export const t_xor = (n, m) => to(mpz.xor(from(n), from(m)));
export const t_not = n => to(mpz.not(from(n)));

export const t_cmp = (n, m) => mpz.compareTo(from(n), from(m));

export const t_fact = n => to(mpz.fact(from(n)));
export const t_gcd = (n, m) => to(mpz.gcd(from(n), from(m)));
export const t_lcm = (n, m) => to(mpz.lcm(from(n), from(m)));

export const t_string = (n, base = 10) => mpz.toString(from(n), base);
export const t_exponential = (n, m) => mpz.toExponential(from(n), m);
export const t_hex = n => mpz.toHex(from(n));

export const t_value = n => mpz.valueOf(from(n));
export const t_u32 = n => BigInt(mpz.toU32(from(n)));
export const t_i32 = n => BigInt(mpz.toI32(from(n)));
export const t_u64 = n => BigInt(mpz.toU64(from(n)));
export const t_i64 = n => BigInt(mpz.toI64(from(n)));

export const t_asIntN = (n, m) => to(mpz.asIntN(n, from(m)));
export const t_asUintN = (n, m) => to(mpz.asUintN(n, from(m)));
