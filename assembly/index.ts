// @ts-ignore
@inline
const LOW_MASK: u32 = 0xffffffff;

// @ts-ignore
@inline
const LIMB_BITS: u32 = 32;

// @ts-ignore
@inline
const BASE: u64 = 1 << LIMB_BITS;

//  BigInteger must support values in this range
//  -2**I32.MAX_VALUE (exclusive) - +2**I32.MAX_VALUE (exclusive)
// However, realistically memory limits the maximum size of the MpZ

// @ts-ignore
@inline
const MAX_LIMBS: u32 = I32.MAX_VALUE; // 2**31-1, experimental: ~2**27-1, realistic: ~< 2**25-1

// @ts-ignore
@inline
function LOW(value: u64): u32 {
  return u32(value & LOW_MASK);
}

// @ts-ignore
@inline
function HIGH(value: u64): u32 {
  return u32(value >> LIMB_BITS);
}

function fromI32(value: i32): MpZ {
  const neg = value < 0;
  if (value < 0) {
    value = -value;
  }
  return fromU32(<u32>value, neg);
}

// @ts-ignore
@inline
function fromU32(value: u32, neg: boolean = false): MpZ {
  return new MpZ([u32(value)], neg);
}

function fromI64(value: i64): MpZ {
  if (value < 0) return fromU64(-(<u64>value), true);
  return fromU64(<u64>value);
}

function fromU64(value: u64, neg: boolean = false): MpZ {
  const hi = HIGH(value);
  const lo = LOW(value);
  if (hi === 0) {
    return fromU32(lo, neg);
  }
  return new MpZ([lo, hi], neg);
}

function codeToU32(code: u32): u32 {
  if (code >= 48 && code <= 57) {
    return <u32>(code - 48);
  }
  if (code >= 65 && code <= 90) {
    return <u32>(code - 55);
  }
  if (code >= 97 && code <= 122) {
    return <u32>(code - 87);
  }
  throw new Error(`Invalid digit code ${code}`);
}

function fromStringU(value: string, base: u32 = 10): MpZ {
  let res = MpZ.ZERO;
  if (value === '0') return res;
  for (let i = 0; i < value.length; i++) {
    const code: u32 = value.charCodeAt(i);
    const val = codeToU32(code);
    res = res.mul(base).add(val);
  }
  return res;
}

function getBase(str: string): u32 {
  if (str.length < 3) return 10;

  if (str.charAt(0) === '0') {
    switch (str.charCodeAt(1)) {
      case 98: // b
      case 66: // B
        return 2;
      case 111: // o
      case 79: // O
        return 8;
      case 120: // x
      case 88: // X
        return 16;
    }
  }
  return 10;
}

function fromString(value: string): MpZ {
  const neg = value.substr(0, 1) === '-';
  value = neg ? value.substr(1) : value;
  const base = getBase(value);

  const r =
    base === 10 ? fromStringU(value, 10) : fromStringU(value.substr(2), base);
  return neg ? r.neg() : r;
}

function u32ToHex(value: u32, pad: boolean = true): string {
  let r = value.toString(16);
  if (!pad) return r;
  return ('00000000' + r).substr(r.length);
}

// TODO: ctz
// TODO: log
// TODO: sqrt
// TODO: fused arithmetic?
// TODO: bitwise operators

// Constants for decimal conversion
// @ts-ignore
@inline
const TO_DECIMAL_M = 9;
const TO_DECIMAL_N = 10 ** TO_DECIMAL_M;
const TO_DECIMAL_P = '0'.repeat(TO_DECIMAL_M);

/** @internal */
export class DivRem<R> {
  div!: MpZ;
  rem!: R;
}

/**
 * # `as-mpz`
 * Immutable arbitrary precision integer library for AssemblyScript.
 *
 * Value is stored as a sign and magnitude.
 *
 * > Note: Arithmatic methods and operators can be used interchangably, with operators acting as shorthand for the methods.
 * > However, the bitwise operators (`&`, `|`, `^`, `>>`, `<<`) are not the same as the bitwise methods (`#and`, `#or`, `#xor`, `#shift`).
 * > The methods return the result of the bitwise operation on the sign-magnitute integer; treating the sign seperate from the magnitude.
 * > Conversely, the operators return the result of the bitwise operation as if the MpZ was a 2's complement signed integer matching JavaScripts BigInt operators.
 * > The difference is subtle, but important for negitive numbers.
 *
 */

// @ts-ignore
@final
export class MpZ {
  // Contains the size and sign of the MpZ
  // The sign is stored as the negation of the size
  // This size excludes leading zero limbs (except for least significant limb)
  protected readonly _sgn_size: i32;

  // Contains the limbs of the MpZ
  // The last limb is the most significant
  // The first limb is the least significant
  // The most significant limb may be zero, never use _data.length to get the size
  protected readonly _data: StaticArray<u32>;

  // Should not be used directly
  // Mutating _data will cause unexpected behavior
  constructor(data: StaticArray<u32>, neg: boolean = false) {
    assert(ASC_NO_ASSERT || data.length > 0, 'MpZ must have at least 1 limb');

    let size = data.length;

    // Reduce size by leading zeros
    while (size > 1 && unchecked(data[size - 1] === 0)) {
      size--;
    }

    if (size === 0) {
      this._data = [0];
      this._sgn_size = 1;
    } else {
      this._data = data;
      this._sgn_size = neg ? -size : size;
    }
  }

  /**
   * #### `MpZ.from(value: i32 | u32 | i64 | u64 | string): MpZ`
   *
   * Creates a new MpZ from a number or string.  The `MpZ.from` method accepts a number or string. The string can be in decimal or hexadecimal format (prefixed with `0x`). The string can also be prefixed with `-` to indicate a negative number.
   *
   * > Note: The MpZ class should not be instantiated directly (using `new`). Instead use the static `MpZ.from` method to create a new MpZ.
   */
  static from<T>(val: T): MpZ {
    if (val instanceof MpZ) return val;
    if (val instanceof i32) return fromI32(val as i32);
    if (val instanceof u32) return fromU32(val as u32);
    if (val instanceof i64) return fromI64(val as i64);
    if (val instanceof u64) return fromU64(val as u64);
    if (typeof val === 'string') return fromString(val);

    throw new TypeError('Unsupported generic type ' + nameof<T>(val));
  }

  /**
   * #### #isNeg(): boolean`
   *
   * Returns `true` if this MpZ is negative, otherwise `false`.
   */
  // @ts-ignore
  @inline
  get isNeg(): boolean {
    return this._sgn_size < 0;
  }

  // Returns the number of limbs in this MpZ (excluding leading zeros)
  // @ts-ignore
  @inline
  get size(): i32 {
    return this._sgn_size < 0 ? -this._sgn_size : this._sgn_size;
  }

  /**
   * #### `#abs(): MpZ`
   *
   * Returns the absolute value of this MpZ.
   */
  abs(): MpZ {
    return this.isNeg ? new MpZ(this._data) : this;
  }

  // *** Addition ***

  /**
   * #### `add(rhs: i32 | u32 | i64 | u64 | MpZ): MpZ`
   *
   * Returns the sum of this MpZ and `rhs`.
   */
  add<T>(rhs: T): MpZ {
    const y = MpZ.from(rhs);

    // if ((u32(this.size) = MAX_LIMBS) || (u32(x.size) = MAX_LIMBS)) {
    //   throw new RangeError('Maximum MpZ size exceeded');
    // }

    if (this.isNeg && y.isNeg) return this._uadd(y).neg(); // -a + -b = -(a + b)
    if (this.isNeg) return y._usub(this); // -a + b = b - a
    if (y.isNeg) return this._usub(y); // a + -b = a - b
    if (y._sgn_size === 1) return this._uaddU32(unchecked(y._data[0]));
    if (this._sgn_size === 1) return y._uaddU32(unchecked(this._data[0]));
    return this._uadd(y);
  }

  // unsigned addition
  // treats values as unsigned
  protected _uadd(rhs: MpZ): MpZ {
    return this.size < rhs.size ? rhs.__uadd(this) : this.__uadd(rhs); // a + b = b + a
  }

  // unsigned addition
  // ordered such that Size(lhs) > Size(rhs)
  // treats values as unsigned
  protected __uadd(rhs: MpZ): MpZ {
    assert(ASC_NO_ASSERT || this.size >= rhs.size, '_uadd: lhs must be >= rhs');

    const q = this.size;
    const z = new StaticArray<u32>(q + 1);

    let k: u64 = 0;
    for (let i: i32 = 0; i < q; ++i) {
      const lx = unchecked(this._data[i]);
      const ly = rhs.size > i ? unchecked(rhs._data[i]) : 0;
      k += u64(lx) + u64(ly);
      unchecked((z[i] = LOW(k)));
      k = HIGH(k);
    }
    unchecked((z[q] = LOW(k)));

    return new MpZ(z);
  }

  // unsigned addition by uint32
  // treats values as unsigned
  protected _uaddU32(rhs: u32): MpZ {
    const q = this.size;
    const z = new StaticArray<u32>(q + 1);

    let k: u32 = rhs;
    for (let i: i32 = 0; i < q; ++i) {
      unchecked((z[i] = k + this._data[i]));
      k = unchecked(z[i] < this._data[i]) ? 1 : 0;
    }
    unchecked((z[q] = k));
    return new MpZ(z);
  }

  // *** Subtraction ***

  /**
   * #### `sub(rhs: i32 | u32 | i64 | u64 | MpZ): MpZ`
   *
   * Returns the difference of this MpZ and the `rhs`.
   */
  sub<T>(rhs: T): MpZ {
    const y = MpZ.from(rhs);

    const sx = this.isNeg;
    const sy = y.isNeg;

    if (sx && sy) return y._usub(this); // -a - -b = b - a
    if (sx) return this._uadd(y).neg(); // -a - b = -(a + b)
    if (sy) return this._uadd(y); // a - -b = a + b
    return this._usub(y);
  }

  // unsigned subtraction
  // treats values as unsigned
  protected _usub(rhs: MpZ): MpZ {
    if (this._ucmp(rhs) < 0) return rhs._usub(this).neg(); // a - b = -(b - a)
    if (rhs.size === 1) return this._usubU32(unchecked(rhs._data[0]));
    return this.__usub(rhs);
  }

  // unsigned sub
  // ordered such that lhs >= rhs
  // treats values as unsigned
  protected __usub(rhs: MpZ): MpZ {
    const q = this.size;
    const z = new StaticArray<u32>(q);

    let k: i64 = 0;
    for (let i: i32 = 0; i < q; ++i) {
      const lx = unchecked(this._data[i]);
      const ly = rhs.size > i ? unchecked(rhs._data[i]) : 0;

      k = i64(lx) - i64(ly) - k;
      unchecked((z[i] = LOW(k)));
      k = k < 0 ? 1 : 0;
    }
    return new MpZ(z);
  }

  // unsigned sub by uint32
  // treats values as unsigned
  protected _usubU32(rhs: u32): MpZ {
    const q = this.size;
    const z = new StaticArray<u32>(q);

    let k: u32 = rhs;
    for (let i: i32 = 0; i < q; ++i) {
      const lx = unchecked(this._data[i]);

      unchecked((z[i] = lx - k));
      k = k > lx ? 1 : 0;
    }

    return new MpZ(z);
  }

  // *** Multiplication ***

  /**
   * #### `mul(rhs: i32 | u32 | i64 | u64 | MpZ): MpZ`
   *
   * Returns the product of this MpZ and the `rhs` (`this * rhs`).
   */
  mul<T>(rhs: T): MpZ {
    const y = MpZ.from(rhs);

    // if (u64(this.size) + u64(y.size) > u64(MAX_LIMBS)) {
    //   throw new RangeError('Maximum MpZ size exceeded');
    // }

    if (this.eqz() || y.eqz()) return MpZ.ZERO;
    if (this.eq(MpZ.ONE)) return y;
    if (y.eq(MpZ.ONE)) return this;

    const q = this.size;
    const p = y.size;

    let z: MpZ;

    if (p === 1) {
      z = this._umulU32(unchecked(y._data[0]));
    } else if (q === 1) {
      z = y._umulU32(unchecked(this._data[0]));
    } else {
      z = this._umul(y);
    }

    return this.isNeg !== y.isNeg ? z.neg() : z;
  }

  // unsigned mul
  // treats values as unsigned
  protected _umul(rhs: MpZ): MpZ {
    const q = this.size;
    const p = rhs.size;
    const z = new StaticArray<u32>(q + p);

    for (let i: i32 = 0; i < q; ++i) {
      let c: u64 = 0;
      for (let j: i32 = 0; j < p; ++j) {
        const k = i + j;
        c +=
          u64(unchecked(this._data[i])) * u64(unchecked(rhs._data[j])) +
          u64(unchecked(z[k]));
        unchecked((z[k] = LOW(c)));
        c = HIGH(c);
      }
      unchecked((z[i + p] = LOW(c)));
    }

    return new MpZ(z);
  }

  // unsigned square
  // treats values as unsigned
  // TODO: optimize for aij = aji
  protected _usqr(): MpZ {
    const q = this.size;
    const z = new StaticArray<u32>(q * 2);

    for (let i: i32 = 0; i < q; ++i) {
      let carry: u64 = 0;
      for (let j: i32 = 0; j < q; ++j) {
        const k = i + j;
        carry +=
          u64(unchecked(this._data[i])) * u64(unchecked(this._data[j])) +
          u64(unchecked(z[k]));
        unchecked((z[k] = LOW(carry)));
        carry = HIGH(carry);
      }
      unchecked((z[i + q] = LOW(carry)));
    }

    return new MpZ(z);
  }

  // unsigned multiply by uint32
  // treats values as unsigned
  protected _umulU32(rhs: u32): MpZ {
    const q = this.size;
    const z = new StaticArray<u32>(q + 1);

    let c: u64 = 0;
    for (let i: i32 = 0; i < q; ++i) {
      c += u64(unchecked(this._data[i])) * u64(rhs);
      unchecked((z[i] = LOW(c)));
      c = HIGH(c);
    }
    unchecked((z[q] = LOW(c)));

    return new MpZ(z);
  }

  // unsigned mul by power of 2
  // treats values as unsigned
  protected _umulpow2U32(rhs: u32): MpZ {
    const q = this.size;
    const z = new StaticArray<u32>(q + 1);

    let c: u64 = 0;
    for (let i: i32 = 0; i < q; ++i) {
      c += u64(unchecked(this._data[i])) << rhs;
      unchecked((z[i] = LOW(c)));
      c = HIGH(c);
    }
    unchecked((z[q] = LOW(c)));

    return new MpZ(z);
  }

  // *** Shifts ***

  // count leading zeros
  protected _clz(): u32 {
    const d = unchecked(this._data[this.size - 1]);
    return <u32>clz(d);
  }

  // returns the number of bits in the magnitude (not the 2's-complement representation) excluding leading zeros
  protected _bits(): u32 {
    return <u32>(this.size * LIMB_BITS - this._clz());
  }

  protected _limbShiftLeft(n: u32): MpZ {
    assert(
      ASC_NO_ASSERT || n < MAX_LIMBS,
      '_limbShiftLeft: n must be less than i32.MAX_VALUE'
    );
    assert(ASC_NO_ASSERT || n >= 0, '_bitShiftRight: n must be > 0');

    if (n === 0) return this;
    const data = this._data.slice();
    const low = new StaticArray<u32>(n);
    return new MpZ(StaticArray.fromArray<u32>(low.concat(data)));
  }

  protected _limbShiftRight(n: u32): MpZ {
    assert(ASC_NO_ASSERT || n >= 0, '_bitShiftRight: n must be > 0');

    if (n === 0) return this;
    if (n >= <u32>this.size) return MpZ.ZERO;
    const data = this._data.slice(n);
    return new MpZ(StaticArray.fromArray<u32>(data));
  }

  protected _bitShiftLeft(n: u32): MpZ {
    assert(
      ASC_NO_ASSERT || n < LIMB_BITS,
      '_bitShiftLeft: n must be less than LIMB_BITS'
    );
    assert(ASC_NO_ASSERT || n >= 0, '_bitShiftRight: n must be > 0');

    return n === 0 ? this : this._umulpow2U32(n);
  }

  protected _bitShiftRight(n: u32): MpZ {
    assert(
      ASC_NO_ASSERT || n < LIMB_BITS,
      '_bitShiftRight: n must be less than LIMB_BITS'
    );
    assert(ASC_NO_ASSERT || n >= 0, '_bitShiftRight: n must be > 0');

    return n === 0 ? this : this._udivPow2U32(n);
  }

  // unsigned divide by power of 2
  // treats values as unsigned
  protected _udivPow2U32(n: u32): MpZ {
    const q = this.size;
    const z = new StaticArray<u32>(q);
    const n2 = 2 ** n;

    let rem: u64 = 0;
    for (let i: i32 = this.size - 1; i >= 0; --i) {
      rem = u64(unchecked(this._data[i])) + (rem << 32);
      unchecked((z[i] = LOW(rem >> n)));
      rem %= n2;
    }

    return new MpZ(z);
  }

  // unsigned multiply by power of 2
  // treats values as unsigned
  protected _umul_pow2(n: u64): MpZ {
    assert(
      ASC_NO_ASSERT || n < LIMB_BITS * MAX_LIMBS,
      '_udiv_pow2: rhs must be < 32*MAX_LIMBS'
    );
    assert(ASC_NO_ASSERT || n >= 0, '_udiv_pow2: rhs must be > 0');

    if (n === 0) return this;

    let z = this;
    const limbs = u32(n / LIMB_BITS);
    if (limbs > 0) z = z._limbShiftLeft(limbs);

    const bits = u32(n % LIMB_BITS);
    if (bits > 0) z = z._bitShiftLeft(bits);

    return z;
  }

  protected _udiv_pow2(n: u64): MpZ {
    assert(
      ASC_NO_ASSERT || n < LIMB_BITS * MAX_LIMBS,
      '_udiv_pow2: rhs must be < 32*MAX_LIMBS'
    );
    assert(ASC_NO_ASSERT || n >= 0, '_udiv_pow2: rhs must be > 0');

    if (n === 0) return this;

    let z = this;

    const bits = u32(n % LIMB_BITS);
    if (bits > 0) z = z._bitShiftRight(bits);

    const limbs = u32(n / LIMB_BITS);
    if (limbs > 0) z = z._limbShiftRight(limbs);

    return z;
  }

  /**
   * #### `#mul_pow2(rhs: i32 | u32 | i64 | u64 | MpZ): MpZ`
   *
   * Returns the product of this MpZ multiplied and `2**rhs` (`this * 2 ** rhs`).
   */
  // multiply by power of 2, using bit shifts
  mul_pow2<T>(rhs: T): MpZ {
    const y = MpZ.from(rhs);
    if (y.eqz()) return this;
    if (this.eqz()) return MpZ.ZERO;
    return this._leftShift(y);
  }

  /**
   * #### `#div_pow2(rhs: i32 | u32 | i64 | u64 | MpZ): MpZ`
   *
   * Returns the quotant of this MpZand `2**rhs` (`this / 2 ** rhs`) truncated towards zero.
   */
  // divide by power of 2, using bit shifts
  div_pow2<T>(rhs: T): MpZ {
    const y = MpZ.from(rhs);
    if (y.eqz()) return this;
    if (this.eqz()) return MpZ.ZERO;
    return this._rightShift(y);
  }

  protected _leftShift(rhs: MpZ): MpZ {
    if (rhs.size > 2) throw new RangeError('Maximum MpZ size exceeded');

    const n = rhs.toU64();
    if ((this.size + n) / LIMB_BITS > MAX_LIMBS) {
      throw new RangeError('Maximum MpZ size exceeded');
    }
    return this.isNeg ? this._umul_pow2(n).neg() : this._umul_pow2(n);
  }

  protected _rightShift(rhs: MpZ): MpZ {
    if (rhs.size > 2) return MpZ.ZERO;

    const n = rhs.toU64();
    if (n > LIMB_BITS * MAX_LIMBS) return MpZ.ZERO;
    return this.isNeg ? this._udiv_pow2(n).neg() : this._udiv_pow2(n);
  }

  /**
   * #### `#bitShift(rhs: i32 | u32 | i64 | u64 | MpZ): MpZ`
   *
   * Returns the value of this MpZ shifted by `rhs`.  Negative values shift right, positive values shift left.
   *
   * > Note: The `#bitShift` method is not the same as the `<<` and `>>` operators. The `#bitShift` method returns the bitwise shift of the unsigned magnitude of the MpZ and rhs. The signedness of the result is equal to signedness of the MpZ. The `<<` and `>>` operators return the result of the bitwise shift as if the MpZ was a 2's complement signed integer; matching JavaScript's built-in BigInt operator.
   */

  bitShift<T>(rhs: T): MpZ {
    const y = MpZ.from(rhs);
    if (y.eqz()) return this;
    if (this.eqz()) return MpZ.ZERO;

    if (y.isNeg) return this._rightShift(y);
    return this._leftShift(l);
  }

  // *** Division ***

  /**
   * #### `div(rhs: MpZ): MpZ`
   *
   * Returns the quotient of this MpZ divided by the `rhs` (`this / rhs`). truncated towards zero
   */
  div<T>(rhs: T): MpZ {
    if (this.eqz()) return MpZ.ZERO;

    const y = MpZ.from(rhs);

    if (y.eqz()) throw new RangeError('Divide by zero');
    if (y.eq(MpZ.ONE)) return this; // x / 1 = x
    if (this.eq(y)) return MpZ.ONE; // x / x = 1

    const sx = this.isNeg;
    const sy = y.isNeg;

    const n = this.abs();
    const d = y.abs();

    if (n.lt(d)) return MpZ.ZERO; // ⌊n / d⌋ = 0 if n < d

    const sz = sx !== sy;

    if (d.size === 1) {
      const r = n._udivU32(unchecked(d._data[0]));
      return sz ? r.neg() : r;
    }

    const p = n._udiv(d);
    return sz ? p.neg() : p;
  }

  // unsigned divide, lhs > rhs
  // Donald Knuth’s Algorithm D
  protected _udiv(rhs: MpZ): MpZ {
    assert(ASC_NO_ASSERT || this > rhs, '_udiv: lhs must be greater than rhs');

    const m = this.size;
    const n = rhs.size;
    const z = new StaticArray<u32>(m - n + 1);

    // D1. [Normalize]
    // Normalize by shifting rhs left just enough so that
    // its high-order bit is on, and shift lhs left the
    // same amount.
    const s = rhs._clz();
    const un = this._umul_pow2(s).toArray();
    const vn = rhs._umul_pow2(s).toArray();

    // We may have to append a high-order
    // digit on the dividend;
    if (un.length === m) {
      un.push(0);
    }

    assert(ASC_NO_ASSERT || un.length === m + 1, '_udiv: un.length !== m + 1');
    assert(ASC_NO_ASSERT || vn.length === n, '_udiv: vn.length !== n');

    // Main loop.
    for (let j = m - n; j >= 0; j--) {
      // D3. [Calculate Q̂]
      const un1: u64 =
        unchecked(u64(un[j + n]) << 32) + unchecked(u64(un[j + n - 1]));
      const vn1 = unchecked(u64(vn[n - 1]));
      let qhat: u64 = un1 / vn1;
      let rhat: u64 = un1 % vn1;

      const vn2 = unchecked(u64(vn[n - 2]));
      const un2 = unchecked(u64(un[j + n - 2]));

      while (true) {
        if (qhat >= BASE || LOW(qhat) * vn2 > (rhat << 32) + un2) {
          qhat -= 1;
          rhat += vn1;
          if (rhat < BASE) continue;
        }
        break;
      }

      // D4. [Multiply and subtract]
      let k: i64 = 0;
      let t: i64 = 0;
      for (let i = 0; i < n; i++) {
        const p: u64 = qhat * unchecked(u64(vn[i]));
        t = unchecked(u64(un[i + j])) - k - LOW(p);
        unchecked((un[i + j] = LOW(t)));
        k = (p >> 32) - (t >> 32);
      }
      t = unchecked(u64(un[j + n])) - k;
      unchecked((un[j + n] = LOW(t)));

      // D5. [Test remainder]
      unchecked((z[j] = LOW(qhat))); // Store quotient digit.
      if (t < 0) {
        // D6. [Add back]

        // If we subtracted too much, add back.
        z[j] -= 1;
        k = 0;
        for (let i = 0; i < n; i++) {
          t = unchecked(u64(un[i + j]) + u64(vn[i])) + k;
          unchecked((un[i + j] = LOW(t)));
          k = t >> 32;
        }
        unchecked((un[j + n] = LOW(u64(un[j + n]) + k)));
      }
    }
    return new MpZ(z);
  }

  // unsigned divide by uint32
  // treats values as unsigned
  protected _udivU32(rhs: u32): MpZ {
    const q = this.size;
    const z = new StaticArray<u32>(q);

    let r: u64 = 0;
    for (let i: i32 = this.size - 1; i >= 0; --i) {
      r = u64(unchecked(this._data[i])) + u64(r << 32);
      unchecked((z[i] = LOW(r / rhs)));
      r %= rhs;
    }

    return new MpZ(z);
  }

  protected _udivRemU32(rhs: u32): DivRem<u32> {
    assert(ASC_NO_ASSERT || !this.isNeg, '_udivRemU32: lhs must be positive');

    const q = this.size;
    const z = new StaticArray<u32>(q);

    let r: u64 = 0;
    for (let i: i32 = q - 1; i >= 0; --i) {
      r = u64(unchecked(this._data[i])) + (r << 32);
      unchecked((z[i] = LOW(r / rhs)));
      r %= rhs;
    }

    return { div: new MpZ(z), rem: LOW(r) };
  }

  // *** Modulus ***

  /**
   * #### `mod(rhs: MpZ): MpZ`
   *
   * Returns the modulus of this MpZ divided by the `rhs`.
   *
   * > Note: The `#mod` method is not the same as the `%` operator.  The `%` operator returns the `#rem` of the division of the lhs and rhs, while the `#mod` method returns the modulo of the lhs and rhs.
   */
  mod<T>(rhs: T): MpZ {
    const r = this.rem(rhs);
    return r.add(rhs).rem(rhs); // modulo = ((n % d) + d) % d
  }

  /**
   * #### `rem(rhs: MpZ): MpZ`
   *
   * Returns the remainder of this MpZ divided by the `rhs` (`this % rhs`).
   *
   * > Note: The `#rem` method is the same as the `%` operator.  The `%` operator returns the `#rem` of the division of the lhs and rhs, while the `#mod` method returns the modulo of the lhs and rhs.
   */
  rem<T>(rhs: T): MpZ {
    const y = MpZ.from(rhs);
    const q = this.div(y);
    return this.sub(y.mul(q));
  }

  // *** Pow ***

  /**
   * #### `pow(rhs: i32 | u32 | i64 | u64 | MpZ): MpZ`
   *
   * Returns the value of this MpZ raised to the power of `rhs` (`this ** rhs`).
   */
  pow<T>(rhs: T): MpZ {
    const y = MpZ.from(rhs);
    if (y.isNeg) return MpZ.ZERO;

    if (y.eqz()) return MpZ.ONE;
    if (this.eqz()) return MpZ.ZERO;
    if (y.eq(MpZ.ONE)) return this;
    if (this.eq(MpZ.ONE)) return MpZ.ONE;

    const sz = this.isNeg && y.isOdd();
    const z =
      y.size === 1 ? this._upowU32(unchecked(y._data[0])) : this._upow(y);
    return sz ? z.neg() : z;
  }

  // unsigned pow
  // exponentiation by squaring (modified)
  // ignores sign of base and exponent
  protected _upow(rhs: MpZ): MpZ {
    let z = MpZ.ONE;
    let x: MpZ = this;

    const p = rhs.size;
    for (let i: i32 = 0; i < p; ++i) {
      let ly = unchecked(rhs._data[i]);

      for (let j: u32 = 0; j < LIMB_BITS; ++j) {
        if (ly & 1) {
          z = z._umul(x);
        }

        ly >>= 1;
        if (ly === 0 && i === p - 1) break;
        x = x._usqr();
      }
    }

    return z;
  }

  // Exponentiation by squaring
  // Ignores sign of base and exponent
  protected _upowU32(rhs: u32): MpZ {
    let z = MpZ.ONE;
    let x: MpZ = this;

    while (true) {
      if (rhs & 1) {
        z = z._umul(x);
      }

      rhs >>= 1;
      if (rhs === 0) break;
      x = x._usqr();
    }

    return z;
  }

  // *** Bitwise operators ***

  /**
   * #### `#not(): MpZ`
   *
   * Returns the bitwise NOT of this MpZ (`~this`).
   */
  // @ts-ignore
  @operator.prefix('~')
  protected not(): MpZ {
    return this.isNeg ? this._usubU32(1) : this._uaddU32(1).neg();
  }

  /**
   * #### `and(rhs: MpZ): MpZ`
   *
   * Returns the bitwise AND of this MpZ and `rhs`.
   *
   * > Note: The `#and` method is not the same as the `&` operator. The `#and` method returns the bitwise `and` of the unsigned magnitude of the MpZ and rhs. The signedness of the result is an `and` of the signedness of the MpZ and rhs. The `&` operator returns the result of the bitwise `and` as if the MpZ was a 2's complement signed integer; matching JavaScript's built-in BigInt operator.
   */
  and<T>(rhs: T): MpZ {
    const y = MpZ.from(rhs);
    const z = this._and(y);
    return this.isNeg && y.isNeg ? z.neg() : z;
  }

  protected _and(rhs: MpZ): MpZ {
    const p = this.size;
    const q = rhs.size;
    const z = new StaticArray<u32>(q > p ? q : p);

    for (let i: i32 = 0; i < z.length; ++i) {
      const lx = this.size > i ? unchecked(this._data[i]) : 0;
      const ly = rhs.size > i ? unchecked(rhs._data[i]) : 0;
      unchecked((z[i] = lx & ly));
    }

    return new MpZ(z);
  }

  protected _andNot(rhs: MpZ): MpZ {
    const p = this.size;
    const q = rhs.size;
    const z = new StaticArray<u32>(q > p ? q : p);

    for (let i: i32 = 0; i < z.length; ++i) {
      const lx = this.size > i ? unchecked(this._data[i]) : 0;
      const ly = rhs.size > i ? unchecked(rhs._data[i]) : 0;
      unchecked((z[i] = ly === 0 ? lx : lx & ~ly));
    }

    return new MpZ(z);
  }

  /**
   * #### `xor(rhs: MpZ): MpZ`
   *
   * Returns the bitwise OR of this MpZ and `rhs`.
   *
   * > Note: The `#or` method is not the same as the `|` operator. The `#or` method returns the bitwise `OR` of the unsigned magnitude of the MpZ and rhs. The signedness of the result is an `and` of the signedness of the MpZ and rhs. The `&` operator returns the result of the bitwise `OR` as if the MpZ was a 2's complement signed integer; matching JavaScript's built-in BigInt operator.
   */
  or<T>(rhs: T): MpZ {
    const y = MpZ.from(rhs);
    const z = this._or(y);
    return this.isNeg || y.isNeg ? z.neg() : z;
  }

  protected _or(rhs: MpZ): MpZ {
    const p = this.size;
    const q = rhs.size;
    const z = new StaticArray<u32>(q > p ? q : p);

    for (let i: i32 = 0; i < z.length; ++i) {
      const lx = this.size > i ? unchecked(this._data[i]) : 0;
      const ly = rhs.size > i ? unchecked(rhs._data[i]) : 0;
      unchecked((z[i] = lx | ly));
    }

    return new MpZ(z);
  }

  /**
   * #### `#xor(rhs: MpZ): MpZ`
   *
   * Returns the bitwise XOR of this MpZ and `rhs`.
   *
   * > Note: The `#xor` method is not the same as the `^` operator. The `#xor` method returns the bitwise `XOR` of the unsigned magnitude of the MpZ and rhs. The signedness of the result is an `XOR` of the signedness of the MpZ and rhs. The `^` operator returns the result of the bitwise `XOR` as if the MpZ was a 2's complement signed integer; matching JavaScript's built-in BigInt operator.
   */
  xor<T>(rhs: T): MpZ {
    const y = MpZ.from(rhs);
    const z = this._xor(y);
    return this.isNeg !== y.isNeg ? z.neg() : z;
  }

  protected _xor(rhs: MpZ): MpZ {
    const p = this.size;
    const q = rhs.size;
    const z = new StaticArray<u32>(q > p ? q : p);

    for (let i: i32 = 0; i < z.length; ++i) {
      const lx = this.size > i ? unchecked(this._data[i]) : 0;
      const ly = rhs.size > i ? unchecked(rhs._data[i]) : 0;
      unchecked((z[i] = lx ^ ly));
    }

    return new MpZ(z);
  }

  /**
   * #### `#isOdd(): MpZ`
   *
   * Returns `true` if this MpZ is odd, otherwise `false`.
   */
  isOdd(): boolean {
    return (unchecked(this._data[0]) & 1) === 1;
  }

  /**
   * #### `#isEven(): boolean`
   *
   * Returns `true` if this MpZ is even, otherwise `false`.
   */
  isEven(): boolean {
    return (unchecked(this._data[0]) & 1) === 0;
  }

  /**
   * #### `#neg(): MpZ`
   *
   * Returns the negation of this MpZ (`-this`).
   */
  // @ts-ignore
  @operator.prefix('-')
  neg(): MpZ {
    if (this.eqz()) return MpZ.ZERO;
    return new MpZ(this._data, !this.isNeg);
  }

  // *** ToString ***

  /**
   * #### `#toString(radix: i32 = 10): string`
   *
   * Returns the value of this MpZ as a string. The radix can be from 2 and 36 (inclusive). The default radix is 10.
   *
   * Note: The resulting string is not prefixed with the radix (e.g. `0x` or `0b`) and therefore not compatible as input to `MpZ.from` (radix of 10 excluded).
   */
  toString(radix: i32 = 10): string {
    if (this.eqz()) return '0';

    if (radix < -10) {
      return this.toString(-radix).toUpperCase();
    }

    if (radix === 10) {
      return this.toDecimal();
    } else if (radix === 16) {
      return this.isNeg ? `-${this._uhex()}` : this._uhex();
    } else if (radix >= 2 && radix <= 36) {
      return this.isNeg ? `-${this._uitoa(radix)}` : this._uitoa(radix);
    } else {
      throw new Error('toString() radix argument must be between 2 and 36');
    }
  }

  /**
   * #### `#toHex(): string`
   *
   * Returns the value of this MpZ as a hexadecimal string.
   *
   * > Note: The resulting string is prefixed with `0x` and is therefore compatible as input to `MpZ.from`.
   */
  toHex(): string {
    if (this.eqz()) return '0x0';

    const s = this._uhex();
    return this.isNeg ? `-0x${s}` : `0x${s}`;
  }

  /**
   * #### `#toDecimal(): string`
   *
   * Returns the value of this MpZ as a decimal string.
   */
  toDecimal(): string {
    if (this.eqz()) return '0';
    return (this.isNeg ? `-` : '') + this.abs()._uitoaDecimal();
  }

  protected _uhex(): string {
    let s = '';

    const q = this.size;
    for (let i: i32 = q - 1; i >= 0; --i) {
      s += u32ToHex(unchecked(this._data[i]), i !== q - 1);
    }

    return s;
  }

  protected _uitoaDecimal(): string {
    const s = new Array<string>();

    let n: MpZ = this;
    while (n.cmp(TO_DECIMAL_N) === 1) {
      const d = n._udivRemU32(TO_DECIMAL_N);
      n = d.div;

      const t = TO_DECIMAL_P + d.rem.toString(10);
      s.unshift(t.slice(-TO_DECIMAL_M));
    }

    if (!n.eqz()) {
      s.unshift(n.abs().toU32().toString(10));
    }

    return s.join('');
  }

  protected _uitoa(base: u32): string {
    const s = new Array<string>();

    let n: MpZ = this;
    while (n.cmp(base) === 1) {
      const d = n._udivRemU32(base);
      n = d.div;
      s.unshift(d.rem.toString(base));
    }

    if (!n.eqz()) {
      s.unshift(n.abs().toU32().toString(base));
    }

    return s.join('');
  }

  // *** ToValue ***

  /**
   * #### `#toValue(): number`
   *
   * Returns the value of this MpZ as a `number`.
   */
  toValue(): number {
    const q = this.size;
    const l1: u64 = unchecked(this._data[q - 1]);
    const z0 = f64(l1) * f64(BASE) ** (q - 1);
    const l2: u64 = q > 1 ? unchecked(this._data[q - 2]) : 0;
    const z1 = f64(l2) * f64(BASE) ** (q - 2);
    const z = z0 + z1;
    return this.isNeg ? -z : z;
  }

  /**
   * #### `#toU32Array(): u32[]`
   *
   * Returns the value of this MpZ as an unsigned 32-bit integer array.  Ther sign of the MpZ is ignored.
   */
  toArray(): u32[] {
    return this._data.slice<u32[]>(0, this.size);
  }

  /**
   * #### `#toU32(): u32`
   *
   * Returns the value of this MpZ as an unsigned 32-bit integer.  If this MpZ is too big to fit in an int32, only the low-order 32 bits are returned.
   * If this MpZ is negative, the returned value is the 2's complement representation of the MpZ.
   */
  toU32(): u32 {
    const z = unchecked(this._data[0]);
    return this.isNeg ? -z : z;
  }

  /**
   * #### `#toI32(): i32`
   *
   * Returns the value of this MpZ as a signed 32-bit integer.  If this MpZ is too big to fit in an int32, only the low-order 32 bits are returned.
   */
  toI32(): i32 {
    const z = unchecked(this._data[0]);
    return this.isNeg ? -z : z;
  }

  /**
   * #### `#toU64(): u64`
   *
   * Returns the value of this MpZ as an unsigned 64-bit integer.  If this MpZ is too big to fit in an int64, only the low-order 64 bits are returned.
   */
  toU64(): u64 {
    const z =
      this.size === 1
        ? u64(unchecked(this._data[0]))
        : (u64(unchecked(this._data[1])) << 32) + u64(unchecked(this._data[0]));
    return this.isNeg ? -z : z;
  }

  /**
   * #### `#toI64(): i64`
   *
   * Returns the value as a signed 64-bit integer.  If this MpZ is too big to fit in an int64, only the low-order 64 bits are returned (the sign is ignored).
   */
  toI64(): i64 {
    const z =
      this.size === 1
        ? u64(unchecked(this._data[0]))
        : (u64(unchecked(this._data[1])) << 32) + u64(unchecked(this._data[0]));
    return this.isNeg ? -z : z;
  }

  // *** Comparison ***

  /**
   * #### `#eqz(): boolean`
   *
   * Returns `true` if this MpZ is equal to zero.
   */
  eqz(): boolean {
    return this.size === 1 && unchecked(this._data[0]) === 0;
  }

  /**
   * #### `#cmp(rhs: MpZ | i32 | u32 | i64 | u64 | string): i32`
   *
   * Returns `-1` if this MpZ is less than the rhs, `0` if this MpZ is equal to the rhs, or `1` if this MpZ is greater than the rhs.
   */
  cmp<T>(rhs: T): i32 {
    const y = MpZ.from(rhs);

    const q = this._sgn_size;
    const p = y._sgn_size;

    if (q > p) return 1;
    if (p > q) return -1;
    if (q < 0) return -this._ucmp(y);
    return this._ucmp(y);
  }

  // unsigned compare
  protected _ucmp(rhs: MpZ): i32 {
    const q = this.size;
    const p = rhs.size;

    if (q !== p) return q > p ? 1 : -1;
    for (let i = q - 1; i >= 0; i--) {
      const lx = unchecked(this._data[i]);
      const ly = unchecked(rhs._data[i]);
      if (lx != ly) {
        return lx > ly ? 1 : -1;
      }
    }
    return 0;
  }

  /**
   * #### `#eq(rhs: MpZ | i32 | u32 | i64 | u64 | string): boolean`
   *
   * Returns `true` if this MpZ is equal to the rhs.
   */
  eq<T>(rhs: T): boolean {
    return this.cmp(MpZ.from(rhs)) === 0;
  }

  /**
   * #### `#ne(rhs: MpZ | i32 | u32 | i64 | u64 | string): boolean`
   *
   * Returns `true` if this MpZ is not equal to the rhs.
   */
  ne<T>(rhs: T): boolean {
    return this.cmp(MpZ.from(rhs)) !== 0;
  }

  /**
   * #### `#gt(rhs: MpZ | i32 | u32 | i64 | u64 | string): boolean`
   *
   * Returns `true` if this MpZ is greater than the rhs.
   */
  gt<T>(rhs: T): boolean {
    return this.cmp(MpZ.from(rhs)) > 0;
  }

  /**
   * #### `#ge(rhs: MpZ | i32 | u32 | i64 | u64 | string): boolean`
   *
   * Returns `true` if this MpZ is greater than or equal to the rhs.
   */
  ge<T>(rhs: T): boolean {
    return this.cmp(MpZ.from(rhs)) >= 0;
  }

  /**
   * #### `#lt(rhs: MpZ | i32 | u32 | i64 | u64 | string): boolean`
   *
   * Returns `true` if this MpZ is less than the rhs.
   */
  lt<T>(rhs: T): boolean {
    return this.cmp(MpZ.from(rhs)) < 0;
  }

  /**
   * #### `#le(rhs: MpZ | i32 | u32 | i64 | u64 | string): boolean`
   *
   * Returns `true` if this MpZ is less than or equal to the rhs.
   */
  le<T>(rhs: T): boolean {
    return this.cmp(MpZ.from(rhs)) <= 0;
  }

  static readonly ZERO: MpZ = new MpZ([0]);
  static readonly ONE: MpZ = new MpZ([1]);
  static readonly TWO: MpZ = new MpZ([2]);

  /**
   * ### Arithmatioc Operators
   *
   * #### `+`, `-`, `*`, `/`
   *
   * Same as the `#add`, `#sub`, `#mul`, `#div` methods.
   */

  // @ts-ignore
  @inline
  @operator('*')
  static mul(lhs: MpZ, rhs: MpZ): MpZ {
    return lhs.mul(rhs);
  }

  // @ts-ignore
  @inline
  @operator('/')
  static div(lhs: MpZ, rhs: MpZ): MpZ {
    return lhs.div(rhs);
  }

  // @ts-ignore
  @inline
  @operator('+')
  static add(lhs: MpZ, rhs: MpZ): MpZ {
    return lhs.add(rhs);
  }

  // @ts-ignore
  @inline
  @operator('-')
  static sub(lhs: MpZ, rhs: MpZ): MpZ {
    return lhs.sub(rhs);
  }

  /**
   * ### Comparison Operators
   *
   * #### `==`, `>`, `>=`, `<`, `<=`, `!=`
   *
   * Same as the `#eq`, `#gt`, `#ge`, `#lt`, `#le`, `#ne` methods.
   */

  // @ts-ignore
  @inline
  @operator('==')
  static eq(lhs: MpZ, rhs: MpZ): boolean {
    return lhs.eq(rhs);
  }

  // @ts-ignore
  @inline
  @operator('>')
  static gt(lhs: MpZ, rhs: MpZ): boolean {
    return lhs.gt(rhs);
  }

  // @ts-ignore
  @inline
  @operator('>=')
  static ge(lhs: MpZ, rhs: MpZ): boolean {
    return lhs.ge(rhs);
  }

  // @ts-ignore
  @inline
  @operator('<')
  static lt(lhs: MpZ, rhs: MpZ): boolean {
    return lhs.lt(rhs);
  }

  // @ts-ignore
  @inline
  @operator('<=')
  static le(lhs: MpZ, rhs: MpZ): boolean {
    return lhs.le(rhs);
  }

  // @ts-ignore
  @inline
  @operator('!=')
  static ne(lhs: MpZ, rhs: MpZ): boolean {
    return !lhs.eq(rhs);
  }

  /**
   * #### `%` operator
   *
   * Returns the remainder of the lhs and rhs.
   *
   * > Note: The `%` operator is not the same as the `#mod` method. The `%` operator returns the `#rem` of the division of the lhs and rhs; matching JavaScript's built-in BigInt operator.
   */
  // @ts-ignore
  @inline
  @operator('%')
  static mod(lhs: MpZ, rhs: MpZ): MpZ {
    return lhs.rem(rhs);
  }

  /**
   * #### `**` operator
   *
   * Returns the power of the lhs to the rhs.
   */
  // @ts-ignore
  @inline
  @operator('**')
  static pow(lhs: MpZ, rhs: MpZ): MpZ {
    return lhs.pow(rhs);
  }

  /**
   * #### `<<` operator
   *
   * Returns the result of the left shift of the lhs by the rhs.  Negitive rhs values will result in a right shift.
   *
   * > Shift operators behave as if they were represented in two's-complement notation (like JavaScripts's primitive integer types).
   */
  // @ts-ignore
  @operator('<<')
  static shl(lhs: MpZ, rhs: MpZ): MpZ {
    if (rhs.isNeg) return MpZ.shr(lhs, rhs.abs());

    if (rhs.eqz()) return lhs;
    if (lhs.eqz()) return MpZ.ZERO;

    return lhs._leftShift(rhs);
  }

  /**
   * #### `>>` operator
   *
   * Returns the result of the right shift of the lhs by the rhs.  Negitive rhs values will result in a left shift.
   *
   * > Shift operators behave as if they were represented in two's-complement notation (like JavaScripts's primitive integer types).
   */
  // @ts-ignore
  @operator('>>')
  static shr(lhs: MpZ, rhs: MpZ): MpZ {
    if (rhs.isNeg) return lhs._leftShift(rhs.abs());

    if (rhs.eqz()) return lhs;
    if (lhs.eqz()) return MpZ.ZERO;

    return lhs.isNeg ? lhs.not()._rightShift(rhs).not() : lhs._rightShift(rhs);
  }

  /**
   * ### `&` operator
   *
   * Returns the bitwise `AND` operation on the two operands.
   *
   * > This operator returns the result of the bitwise `AND` as if the values were 2's complement signed integers; matching JavaScript's built-in BigInt operators.
   */
  // @ts-ignore
  @operator('&')
  static and(lhs: MpZ, rhs: MpZ): MpZ {
    if (!lhs.isNeg && !rhs.isNeg) {
      return lhs._and(rhs);
    }
    if (lhs.isNeg && rhs.isNeg) {
      return lhs.not()._or(rhs.not()).not();
    }
    if (lhs.isNeg) {
      return rhs._andNot(lhs.not());
    }
    return lhs._andNot(rhs.not());
  }

  /**
   * ### `|` operator
   *
   * Returns the bitwise `OR` operation on the two operands.
   *
   * > This operator returns the result of the bitwise `OR` as if the values were 2's complement signed integers; matching JavaScript's built-in BigInt operators.
   */
  // @ts-ignore
  @operator('|')
  static or(lhs: MpZ, rhs: MpZ): MpZ {
    if (!lhs.isNeg && !rhs.isNeg) {
      return lhs._or(rhs);
    }
    if (lhs.isNeg && rhs.isNeg) {
      return lhs.not()._and(rhs.not()).not();
    }
    if (lhs.isNeg) {
      return lhs.not()._andNot(rhs).not();
    }
    return rhs.not()._andNot(lhs).not();
  }

  /**
   * ### `^` operator
   *
   * Returns the bitwise `XOR` operation on the two operands.
   *
   * > This operator returns the result of the bitwise `XOR` as if the values were 2's complement signed integers; matching JavaScript's built-in BigInt operators.
   */
  // @ts-ignore
  @operator('^')
  static xor(lhs: MpZ, rhs: MpZ): MpZ {
    if (!lhs.isNeg && !rhs.isNeg) {
      return lhs._xor(rhs);
    }
    if (lhs.isNeg && rhs.isNeg) {
      return lhs.not()._xor(rhs.not());
    }
    if (lhs.isNeg) {
      return rhs._xor(lhs.not()).not();
    }
    return lhs._xor(rhs.not()).not();
  }
}
