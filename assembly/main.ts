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

export function toExponential(a: MpZ, fractionDigits: u32 = 0): string {
  return a.toExponential(fractionDigits);
}

export function toHex(a: MpZ): string {
  return a.toHex();
}

export function valueOf(a: MpZ): number {
  return a.valueOf();
}

export function toU64(a: MpZ): u64 {
  return a.toU64();
}

export function toI64(a: MpZ): i64 {
  return a.toI64();
}

export function toU32(a: MpZ): u32 {
  return a.toU32();
}

export function toI32(a: MpZ): i32 {
  return a.toI32();
}

export function mul_pow2(a: MpZ, b: u64): MpZ {
  return a.mul_pow2(b);
}

export function div_pow2(a: MpZ, b: u64): MpZ {
  return a.div_pow2(b);
}

export function shl(a: MpZ, b: MpZ): MpZ {
  return a << b;
}

export function shr(a: MpZ, b: MpZ): MpZ {
  return a >> b;
}

export function and(a: MpZ, b: MpZ): MpZ {
  return a & b;
}

export function or(a: MpZ, b: MpZ): MpZ {
  return a | b;
}

export function xor(a: MpZ, b: MpZ): MpZ {
  return a ^ b;
}

export function not(a: MpZ): MpZ {
  return ~a;
}

export function add(a: MpZ, b: MpZ): MpZ {
  return a + b;
}

export function inc(a: MpZ): MpZ {
  return ++a;
}

export function mul(a: MpZ, b: MpZ): MpZ {
  return a * b;
}

export function div(a: MpZ, b: MpZ): MpZ {
  return a / b;
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

export function powMod(a: MpZ, b: MpZ, c: MpZ): MpZ {
  return a.powMod(b, c);
}

export function sub(a: MpZ, b: MpZ): MpZ {
  return a.sub(b);
}

export function dec(a: MpZ): MpZ {
  return --a;
}

export function eqz(a: MpZ): boolean {
  return a.eqz();
}

export function compareTo(a: MpZ, b: MpZ): i32 {
  return a.compareTo(b);
}

export function fact(a: MpZ): MpZ {
  return a.fact();
}

export function isqrt(a: MpZ): MpZ {
  return a.isqrt();
}

export function log2(a: MpZ): MpZ {
  return a.log2();
}

export function log10(a: MpZ): MpZ {
  return a.log10();
}

export function iroot(a: MpZ, b: u32): MpZ {
  return a.iroot(b);
}

export function gcd(a: MpZ, b: MpZ): MpZ {
  return a.gcd(b);
}

export function lcm(a: MpZ, b: MpZ): MpZ {
  return a.lcm(b);
}

export function asIntN(bits: u32, a: MpZ): MpZ {
  return MpZ.asIntN(bits, a);
}

export function asUintN(bits: u32, a: MpZ): MpZ {
  return MpZ.asUintN(bits, a);
}

export function negate(a: MpZ): MpZ {
  return a.negate();
}

// x % 2n == x & (2n - 1)
