/**
 * Warning: These exports may change unexpectedly.
 * This file is provided as a convenience for testing in JavaScript.
 * Please use the MpZ class directly for AssemblyScript development.
 */

import { MpZ } from '.';

export const ZERO = MpZ.ZERO;
export const ONE = MpZ.ONE;

export function from(a: string): MpZ {
  return MpZ.from(a);
}

export function toString(a: MpZ, base: u32 = 10): string {
  return a.toString(base);
}

export function toHex(a: MpZ): string {
  return a.toHex();
}

export function mul_pow2(a: MpZ, b: u64): MpZ {
  return a.mul_pow2(b);
}

export function div_pow2(a: MpZ, b: u64): MpZ {
  return a.div_pow2(b);
}

export function shl(a: MpZ, b: MpZ): MpZ {
  return MpZ.shl(a, b);
}

export function shr(a: MpZ, b: MpZ): MpZ {
  return MpZ.shr(a, b);
}

export function and_op(a: MpZ, b: MpZ): MpZ {
  return a & b;
}

export function or_op(a: MpZ, b: MpZ): MpZ {
  return a | b;
}

export function xor_op(a: MpZ, b: MpZ): MpZ {
  return a ^ b;
}

export function not(a: MpZ): MpZ {
  return a.not();
}

export function add(a: MpZ, b: MpZ): MpZ {
  return a.add(b);
}

export function mul(a: MpZ, b: MpZ): MpZ {
  return a.mul(b);
}

export function div(a: MpZ, b: MpZ): MpZ {
  return a.div(b);
}

export function mod(a: MpZ, b: MpZ): MpZ {
  return a.mod(b);
}

export function rem(a: MpZ, b: MpZ): MpZ {
  return a.rem(b);
}

export function pow(a: MpZ, b: MpZ): MpZ {
  return a.pow(b);
}

export function sub(a: MpZ, b: MpZ): MpZ {
  return a.sub(b);
}

export function eqz(a: MpZ): boolean {
  return a.eqz();
}

export function cmp(a: MpZ, b: MpZ): i32 {
  return a.cmp(b);
}

export function fact(n: u32): MpZ {
  let a = MpZ.from(1);
  for (let i: u32 = 1; i <= n; ++i) {
    a = MpZ.from(i).mul(a);
  }
  return a;
}
