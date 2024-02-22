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
  return neg ? r.negate() : r;
}

// @ts-ignore
@lazy
const LOG2_10: f64 = Math.log2(10);

// Constants for decimal conversion
// @ts-ignore
@inline
const DIGITS_PER_LIMB = 9;

// @ts-ignore
@inline
const TO_DECIMAL_N = 1000000000; // 10 ** 9;

/** @internal */
export class DivRem<R> {
  div!: MpZ;
  rem!: R;
}

/**
 * ## `as-mpz` API
 *
 * Value is stored as a sign and magnitude.
 *
 * > Note: Arithmatic methods and operators can be used interchangably, with operators acting as shorthand for the methods.
 * > However, unlike instance methods, the operators do not coerce inputs to an MpZ.
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
   * ### Constructor
   */

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
   * ### Instance Methods
   */

  /**
   * #### `#isNeg(): boolean`
   *
   * @returns `true` if `this` MpZ is negative, otherwise `false`.
   */
  // @ts-ignore
  @inline
  get isNeg(): boolean {
    return this._sgn_size < 0;
  }

  // Returns the number of limbs in `this` MpZ (excluding leading zeros)
  // @ts-ignore
  @inline
  get size(): i32 {
    return this._sgn_size < 0 ? -this._sgn_size : this._sgn_size;
  }

  /**
   * #### `#abs(): MpZ`
   *
   * @returns the absolute value of `this` MpZ.
   */
  abs(): MpZ {
    return this.isNeg ? new MpZ(this._data) : this;
  }

  /**
   * #### `#sign(): MpZ`
   *
   * @returns the sign of `this` MpZ, indicating whether x is positive (`1`), negative (`-1`), or zero (`0`).
   */
  sign(): i32 {
    if (this._sgn_size < 0) return -1;
    if (this.eqz()) return 0;
    return 1;
  }

  /**
   * #### `#isOdd(): MpZ`
   *
   * @returns `true` if `this` MpZ is odd, otherwise `false`.
   */
  isOdd(): boolean {
    return (unchecked(this._data[0]) & 1) === 1;
  }

  /**
   * #### `#isEven(): boolean`
   *
   * @returns `true` if `this` MpZ is even, otherwise `false`.
   */
  isEven(): boolean {
    return (unchecked(this._data[0]) & 1) === 0;
  }

  /**
   * #### `#negate(): MpZ`
   *
   * @returns the negation of `this` MpZ (`-this`).
   */
  // @ts-ignore
  negate(): MpZ {
    if (this.eqz()) return MpZ.ZERO;
    return new MpZ(this._data, !this.isNeg);
  }

  // *** Addition ***

  /**
   * #### `#add(rhs: i32 | u32 | i64 | u64 | MpZ): MpZ`
   *
   * @returns the sum of `this` MpZ and `rhs`.
   */
  // @ts-ignore
  add<T>(rhs: T): MpZ {
    const y = MpZ.from(rhs);

    if (this.isNeg && y.isNeg) return this._uadd(y).negate(); // -a + -b = -(a + b)
    if (this.isNeg) return y._usub(this); // -a + b = b - a
    if (y.isNeg) return this._usub(y); // a + -b = a - b
    return this._uadd(y);
  }

  // unsigned addition
  // treats values as unsigned
  protected _uadd(rhs: MpZ): MpZ {
    if (this.size < rhs.size) return rhs._uadd(this); // a + b = b + a
    if (rhs.size === 1) return this._uaddU32(unchecked(rhs._data[0]));
    return this.__uadd(rhs);
  }

  // unsigned addition
  // ordered such that Size(lhs) > Size(rhs)
  // treats values as unsigned
  protected __uadd(rhs: MpZ): MpZ {
    const q = this.size;
    const p = rhs.size;

    assert(ASC_NO_ASSERT || q >= p, '_uadd: Size(lhs) must be >= Size(rhs)');

    const z = new StaticArray<u32>(q + 1);

    let k: bool = 0;
    let i: i32 = 0;
    for (; i < p; ++i) {
      const lx = unchecked(this._data[i]);
      const ly = unchecked(rhs._data[i]);
      unchecked((z[i] = lx + ly + k));
      k = unchecked(z[i] < lx) || unchecked(k && z[i] === lx);
    }
    for (; i < q; ++i) {
      const lx = unchecked(this._data[i]);
      unchecked((z[i] = lx + k));
      k = unchecked(z[i] < lx);
    }
    unchecked((z[q] = k));

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

  /**
   * #### `#inc(): MpZ`
   *
   * @returns the increment of `this` MpZ (`this + 1`).
   */
  @operator.prefix('++')
  @operator.postfix('++')
  inc(): MpZ {
    if (this.isNeg) return this._udec().negate(); // -a + 1 = -(a - 1)
    return this._uinc();
  }

  protected _uinc(): MpZ {
    // TODO: optimize by couting bits?
    const q = this.size;
    const z = new StaticArray<u32>(q + 1);

    let k: bool = 1;
    for (let i: i32 = 0; i < q; ++i) {
      unchecked((z[i] = k + this._data[i]));
      k = unchecked(z[i] < this._data[i]);
    }
    unchecked((z[q] = k));
    return new MpZ(z);
  }

  // *** Subtraction ***

  /**
   * #### `#sub(rhs: i32 | u32 | i64 | u64 | MpZ): MpZ`
   *
   * @returns the difference of `this` MpZ and the `rhs`.
   */
  sub<T>(rhs: T): MpZ {
    const y = MpZ.from(rhs);

    const sx = this.isNeg;
    const sy = y.isNeg;

    if (sx && sy) return y._usub(this); // -a - -b = b - a
    if (sx) return this._uadd(y).negate(); // -a - b = -(a + b)
    if (sy) return this._uadd(y); // a - -b = a + b
    return this._usub(y);
  }

  // unsigned subtraction
  // treats values as unsigned
  protected _usub(rhs: MpZ): MpZ {
    if (this._ucmp(rhs) < 0) return rhs._usub(this).negate(); // a - b = -(b - a)
    if (rhs.size === 1) return this._usubU32(unchecked(rhs._data[0]));
    return this.__usub(rhs);
  }

  // unsigned sub
  // ordered such that lhs >= rhs
  // treats values as unsigned
  protected __usub(rhs: MpZ): MpZ {
    const q = this.size;
    const p = rhs.size;

    assert(ASC_NO_ASSERT || q >= p, '_uadd: Size(lhs) must be >= Size(rhs)');

    const z = new StaticArray<u32>(q);

    let k: i64 = 0;
    let i: i32 = 0;
    for (; i < p; ++i) {
      const lx = unchecked(this._data[i]);
      const ly = unchecked(rhs._data[i]);

      k = i64(lx) - i64(ly) - k;
      unchecked((z[i] = LOW(k)));
      k = k < 0 ? 1 : 0;
    }
    for (; i < q; ++i) {
      const lx = unchecked(this._data[i]);

      k = i64(lx) - k;
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

  /**
   * #### `#dec(): MpZ`
   *
   * @returns the decrement of `this` MpZ (`this - 1`).
   */
  @operator.prefix('--')
  @operator.postfix('--')
  dec(): MpZ {
    if (this.isNeg) return this._uinc().negate(); // -a - 1 = -(a + 1)
    if (this.eqz()) return MpZ.ONE.negate();
    return this._udec();
  }

  protected _udec(): MpZ {
    // TODO: optimize by couting bits?
    const q = this.size;
    const z = new StaticArray<u32>(q);

    let k: bool = 1;
    for (let i: i32 = 0; i < q; ++i) {
      const lx = unchecked(this._data[i]);

      unchecked((z[i] = lx - k));
      k = k > lx ? 1 : 0;
    }

    return new MpZ(z);
  }

  // *** Multiplication ***

  /**
   * #### `#mul(rhs: i32 | u32 | i64 | u64 | MpZ): MpZ`
   *
   * @returns the product of `this` MpZ and the `rhs` (`this * rhs`).
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

    return this.isNeg !== y.isNeg ? z.negate() : z;
  }

  /**
   * #### `#mul_pow2(rhs: i32 | u32 | i64 | u64 | MpZ): MpZ`
   *
   * @returns the product of `this` MpZ multiplied and `2**rhs` (`this * 2 ** rhs`).
   */
  // multiply by power of 2, using bit shifts
  mul_pow2<T>(rhs: T): MpZ {
    const y = MpZ.from(rhs);
    if (y.eqz()) return this;
    if (this.eqz()) return MpZ.ZERO;
    return this._leftShift(y);
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

  // *** Division ***

  /**
   * #### `#div(rhs: MpZ): MpZ`
   *
   * @returns the quotient of `this` MpZ divided by the `rhs` (`trunc(this / rhs)`) truncated towards zero.
   * @throws RangeError if `rhs` is zero.
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
      return sz ? r.negate() : r;
    }

    const p = n._udiv(d);
    return sz ? p.negate() : p;
  }

  /**
   * #### `#div_pow2(rhs: i32 | u32 | i64 | u64 | MpZ): MpZ`
   *
   * @returns the quotant of `this` MpZand `2**rhs` (`this / 2 ** rhs`) truncated towards zero.
   */
  // divide by power of 2, using bit shifts
  div_pow2<T>(rhs: T): MpZ {
    const y = MpZ.from(rhs);
    if (y.eqz()) return this;
    if (this.eqz()) return MpZ.ZERO;
    return this._rightShift(y);
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
   * #### `#mod(rhs: MpZ): MpZ`
   *
   * @returns the modulus of `this` MpZ divided by the `rhs`.
   * @throws RangeError if `rhs` is zero.
   *
   * > Note: The `#mod` method is not the same as the `%` operator.  The `%` operator returns the `#rem` of the division of the lhs and rhs, while the `#mod` method returns the modulo of the lhs and rhs.
   */
  mod<T>(rhs: T): MpZ {
    const y = MpZ.from(rhs);
    const r = this._rem(y);
    if (this.isNeg === y.isNeg) return r;
    if (r.eqz()) return MpZ.ZERO;
    return r.add(y);
  }

  /**
   * #### `#rem(rhs: MpZ): MpZ`
   *
   * @returns the remainder of `this` MpZ divided by the `rhs` (`this % rhs`).
   * @throws RangeError if `rhs` is zero.
   *
   * > Note: The `#rem` method is the same as the `%` operator.  The `%` operator returns the `#rem` of the division of the lhs and rhs, while the `#mod` method returns the modulo of the lhs and rhs.
   */
  rem<T>(rhs: T): MpZ {
    const y = MpZ.from(rhs);
    return this._rem(y);
  }

  protected _rem(rhs: MpZ): MpZ {
    const q = this.div(rhs);
    return this.sub(rhs.mul(q));
  }

  // *** Pow ***

  /**
   * #### `#pow(rhs: i32 | u32 | i64 | u64 | MpZ): MpZ`
   *
   * @returns the value of `this` MpZ raised to the power of `rhs` (`this ** rhs`).
   * @throws RangeError if `rhs` is negative and `this` is zero.
   */
  pow<T>(rhs: T): MpZ {
    const y = MpZ.from(rhs);
    if (y.isNeg) throw new RangeError('rhs must be greater than 0');

    if (this.eq(MpZ.ONE)) return MpZ.ONE;
    if (y.eqz()) return MpZ.ONE;
    if (this.eqz()) return MpZ.ZERO;
    if (y.eq(MpZ.ONE)) return this;

    const sz = this.isNeg && y.isOdd();
    const z =
      y.size === 1 ? this._upowU32(unchecked(y._data[0])) : this._upow(y);
    return sz ? z.negate() : z;
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

  /**
   * #### `# powMod(rhs: i32 | u32 | i64 | u64 | MpZ, m: i32 | u32 | i64 | u64 | MpZ): MpZ`
   *
   * @returns the value of `this` MpZ raised to the power of `rhs` mod `m` (`this ** rhs mod m`).
   * @throws RangeError if `m` is <= 0.
   * @throws RangeError if `rhs` is negative.
   */
  // TODO: Support negative exponents (modular inverse)
  powMod<T, X>(rhs: T, m: X): MpZ {
    const x = this;
    const y = MpZ.from(rhs);
    const n = MpZ.from(m);

    if (n.isNeg || n.eqz())
      throw new RangeError('Modulus must be greater than 0');
    if (y.isNeg) throw new RangeError('rhs must be greater than 0');

    if (y.eqz()) return MpZ.ONE;
    if (x.eqz()) return MpZ.ZERO;
    if (y.eq(MpZ.ONE)) return x.mod(m);
    if (x.eq(MpZ.ONE)) return MpZ.ONE;

    let z = x.abs()._upowMod(y, n);
    if (z.eqz()) return MpZ.ZERO;

    if (x.isNeg && y.isOdd()) return z.negate().add(n);
    return z;
  }

  // unsigned pow mod
  // exponentiation by squaring (modified)
  // `this` must be positive
  protected _upowMod(rhs: MpZ, m: MpZ): MpZ {
    assert(ASC_NO_ASSERT || !this.isNeg, '_upowMod: lhs must be positive');

    let z = MpZ.ONE;
    let x: MpZ = this.rem(m);

    const p = rhs.size;
    for (let i: i32 = 0; i < p; ++i) {
      let ly = unchecked(rhs._data[i]);

      for (let j: u32 = 0; j < LIMB_BITS; ++j) {
        if (ly & 1) {
          z = z._umul(x).rem(m);
        }

        ly >>= 1;
        if (ly === 0 && i === p - 1) break;
        x = x._usqr().rem(m);
      }
    }

    return z;
  }

  /**
   * #### `#sqrt(): MpZ`
   *
   * @returns the greatest integer less than or equal to the square root of `this`.
   * @throws RangeError if `this` is negative.
   */
  isqrt(): MpZ {
    if (this.isNeg) {
      throw new RangeError(
        'Square root of negative number is not a real number'
      );
    }
    if (this.lt(2)) return this;

    let x0 = this._bitShiftRight(1);
    let x1 = x0._uadd(this.div(x0))._bitShiftRight(1);

    while (x1 < x0) {
      x0 = x1;
      x1 = x0._uadd(this.div(x0))._bitShiftRight(1);
    }

    return x0;
  }

  /**
   * #### `#iroot(n: u32): MpZ`
   *
   * @returns the greatest integer less than or equal to the nth root of `this`.
   * @throws RangeError if `n` is zero or `this` is negative and `n` is even.
   */
  iroot(k: u32): MpZ {
    if (k === 0) throw new RangeError('Root must be greater than 0');

    if (this.isNeg) {
      if (k % 2 === 0) {
        throw new RangeError('Root of negative number is not a real number');
      }
      return this.abs()._uiroot(k).negate();
    }

    return this._uiroot(k);
  }

  protected _uiroot(k: u32): MpZ {
    if (this.lt(2)) return this;

    const n1 = MpZ.from(k - 1);

    let d = this._uaddU32(1);
    let e: MpZ = this;

    while (e < d) {
      d = e;
      e = e
        ._umul(n1)
        ._uadd(this.div(e._upow(n1)))
        ._udivU32(k);
    }

    return d;
  }

  /**
   * #### `#log2(): MpZ`
   *
   * @returns the base 2 logarithm of `this`.
   * @throws RangeError if `this` is negative or zero.
   */
  log2(): MpZ {
    if (this.isNeg) throw new RangeError('Logarithm of negative number');
    if (this.eqz()) throw new RangeError('Logarithm of zero');
    if (this.lt(2)) return MpZ.ZERO;

    return MpZ.from(this._bits() - 1);
  }

  // Returns the ceiling of the base 10 logarithm of `this`
  // Assumes x > 1
  protected _ceilLog10(): u64 {
    if (this.lt(10)) return 1;

    const k = f64(this._bits() - 1);
    const z = u64(k / LOG2_10); // ~log2(x)/log2(10) < 2.1*10^10
    return z + 1;
  }

  /**
   * #### `#log10(): MpZ`
   *
   * @returns the base 10 logarithm of `this`.
   * @throws RangeError if `this` is negative or zero.
   */
  log10(): MpZ {
    if (this.isNeg) throw new RangeError('Logarithm of negative number');
    if (this.eqz()) throw new RangeError('Logarithm of zero');
    if (this.lt(10)) return MpZ.ZERO;

    assert(
      ASC_NO_ASSERT || this.log2().size < 3,
      'log10: internal assumption failed'
    );

    // Correcting ceilLog10
    const x = this.abs();
    const z = x._ceilLog10();
    const t = MpZ.TEN.pow(z);
    return x.ge(t) ? MpZ.from(z) : MpZ.from(z - 1);

    // Direct implementation
    // let x = this.abs();
    // let k: u64 = 0;

    // while (!x.eqz()) {
    //   x = x.div(10);
    //   k++;
    // }

    // return MpZ.from(k - 1);
  }

  /**
   * #### `#fact(): MpZ`
   *
   * @returns the factorial of `this` MpZ (`this!`).
   * @throws RangeError if `this` is negative or too large (greater than `MAX_INTEGER`).
   */
  fact(): MpZ {
    if (this.isNeg) throw new RangeError('Factorial of negative number');
    if (this.eqz()) return MpZ.ONE;
    if (this.size > 1) throw new RangeError('Factorial of large number');
    return this._fact();
  }

  protected _fact(): MpZ {
    let x = this.toU32();
    let z = MpZ.ONE;
    while (x > 1) {
      z = z.mul(x--);
    }
    return z;
  }

  /**
   * #### `#gcd(rhs: i32 | u32 | i64 | u64 | MpZ): MpZ`
   *
   * @returns the greatest common divisor of `this` MpZ and `rhs`.
   */
  gcd<T>(rhs: T): MpZ {
    const y = MpZ.from(rhs);
    if (this.eqz()) return y.abs();
    const x = this.abs();
    if (y.eqz()) return x;

    return x._gcd(y.abs());
  }

  protected _gcd(rhs: MpZ): MpZ {
    let x: MpZ = this;
    let y = rhs;

    const i = x._ctz();
    x = x._udiv_pow2(i);

    const j = y._ctz();
    y = y._udiv_pow2(j);

    const k = min(i, j);

    while (true) {
      if (y > x) {
        const t = x;
        x = y;
        y = t;
      }

      x = x._usub(y);
      if (x.eqz()) return y._umul_pow2(k);

      x = x._udiv_pow2(x._ctz());
    }
  }

  /**
   * #### `#lcm(rhs: i32 | u32 | i64 | u64 | MpZ): MpZ`
   *
   * @returns the least common multiple of `this` MpZ and `rhs`.
   */
  lcm<T>(rhs: T): MpZ {
    let y = MpZ.from(rhs);
    if (this.eqz() || y.eqz()) return MpZ.ZERO;

    const x = this.abs();
    y = y.abs();
    return x.mul(y).div(x._gcd(y));
  }

  // *** Shifts ***

  // Gets the value of the bit at the specified position (2's complement)
  protected _getBit(n: u64): bool {
    const limb = <i32>(n / LIMB_BITS);
    if (limb >= this.size) return this.isNeg;

    const x = this.isNeg ? this.not() : this;

    const mask = 1 << u32(n % LIMB_BITS);
    const b = unchecked(x._data[limb]) & mask;
    return this.isNeg === !b ? 1 : 0;
  }

  // count leading zeros (doesn't count sign bit, treats value as unsigned)
  protected _clz(): u32 {
    const d = unchecked(this._data[this.size - 1]);
    return <u32>clz(d);
  }

  // count trailing zeros (doesn't count sign bit, treats value as unsigned)
  protected _ctz(): u64 {
    if (this.eqz()) return 0;

    let l: u32 = 0;
    while (unchecked(this._data[l]) === 0) {
      l++;
    }
    return l * LIMB_BITS + ctz(unchecked(this._data[l]));
  }

  // returns the number of bits in the magnitude excluding leading zeros
  // doesn't count sign bit, treats value as unsigned
  protected _bits(): u64 {
    return u64(this.size) * LIMB_BITS - this._clz();
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

  // unsigned multiply by power of 2 using bit shifts
  // treats values as unsigned
  protected _umul_pow2(n: u64): MpZ {
    assert(
      ASC_NO_ASSERT || n < LIMB_BITS * MAX_LIMBS,
      '_udiv_pow2: rhs must be < 32*MAX_LIMBS'
    );
    assert(ASC_NO_ASSERT || n >= 0, '_udiv_pow2: rhs must be > 0');

    if (n === 0) return this;

    let z: MpZ = this;
    const limbs = u32(n / LIMB_BITS);
    if (limbs > 0) z = z._limbShiftLeft(limbs);

    const bits = u32(n % LIMB_BITS);
    if (bits > 0) z = z._bitShiftLeft(bits);

    return z;
  }

  // unsigned divide by power of 2 using bit shifts
  // treats values as unsigned
  protected _udiv_pow2(n: u64): MpZ {
    assert(
      ASC_NO_ASSERT || n < LIMB_BITS * MAX_LIMBS,
      '_udiv_pow2: rhs must be < 32*MAX_LIMBS'
    );
    assert(ASC_NO_ASSERT || n >= 0, '_udiv_pow2: rhs must be > 0');

    if (n === 0) return this;

    let z: MpZ = this;

    const bits = u32(n % LIMB_BITS);
    if (bits > 0) z = z._bitShiftRight(bits);

    const limbs = u32(n / LIMB_BITS);
    if (limbs > 0) z = z._limbShiftRight(limbs);

    return z;
  }

  protected _leftShift(rhs: MpZ): MpZ {
    if (rhs.size > 2) throw new RangeError('Maximum MpZ size exceeded');

    const n = rhs.toU64();
    if ((this.size + n) / LIMB_BITS > MAX_LIMBS) {
      throw new RangeError('Maximum MpZ size exceeded');
    }
    return this.isNeg ? this._umul_pow2(n).negate() : this._umul_pow2(n);
  }

  protected _rightShift(rhs: MpZ): MpZ {
    if (rhs.size > 2) return MpZ.ZERO;

    const n = rhs.toU64();
    if (n > LIMB_BITS * MAX_LIMBS) return MpZ.ZERO;
    return this.isNeg ? this._udiv_pow2(n).negate() : this._udiv_pow2(n);
  }

  /**
   * #### `#shiftLeft(rhs: i32 | u32 | i64 | u64 | MpZ): MpZ`
   *
   * @returns the value of `this` MpZ left shifted by `rhs` (`this << rhs`). Negative `rhs` values shift right.
   * @throws RangeError if the result exceeds the maximum MpZ size.
   *
   * > Note: The `#shiftLeft` method return the result of the bitwise shift as if the MpZ was a 2's complement signed integer; matching JavaScript's BigInt `<<` operator.
   */
  shiftLeft<T>(rhs: T): MpZ {
    const y = MpZ.from(rhs);
    if (y.isNeg) return this.shiftRight(y.negate());

    if (y.eqz()) return this;
    if (this.eqz()) return MpZ.ZERO;

    return this._leftShift(y);
  }

  /**
   * #### `#shiftRight(rhs: i32 | u32 | i64 | u64 | MpZ): MpZ`
   *
   * @returns the value of `this` MpZ right shifted by `rhs` (`this >> rhs`).  Negative `rhs` values shift left.
   * @throws RangeError if the result exceeds the maximum MpZ size.
   *
   * > Note: The `#shiftLeft` method return the result of the bitwise shift as if the MpZ was a 2's complement signed integer; matching JavaScript's BigInt `>>` operator.
   */
  shiftRight<T>(rhs: T): MpZ {
    const y = MpZ.from(rhs);
    if (y.isNeg) return this._leftShift(y.negate());
    if (y.eqz()) return this;
    if (this.eqz()) return MpZ.ZERO;

    return this.isNeg ? this.not()._rightShift(y).not() : this._rightShift(y);
  }

  // *** Bitwise operators ***

  /**
   * #### `#not(): MpZ`
   *
   * @returns the bitwise NOT of `this` MpZ (`~this`).
   *
   * > Note: The `#not` method returns the result as if the MpZ was a 2's complement signed integer (yeilding `-(x + 1)`); matching JavaScript's BigInt `~` operator.
   */
  not(): MpZ {
    return this.isNeg ? this._udec() : this._uinc().negate();
  }

  /**
   * #### `#and(rhs: MpZ): MpZ`
   *
   * @returns the bitwise AND of `this` MpZ and `rhs`.
   *
   * > Note: The `#and` method returns the result of the bitwise `AND` as if the MpZ was a 2's complement signed integer; matching JavaScript's `&` BigInt operator.
   */
  and<T>(rhs: T): MpZ {
    const y = MpZ.from(rhs);
    if (!this.isNeg && !y.isNeg) return this._and(y);
    if (this.isNeg && y.isNeg) return this.not()._or(y.not()).not(); // x & y = ~(~x | ~y)
    if (this.isNeg) return y._andNot(this.not()); // x & y = y & ~~x
    return this._andNot(y.not()); // x & y = x & ~~y
  }

  protected _and(rhs: MpZ): MpZ {
    const p = this.size;
    const q = rhs.size;
    const z = new StaticArray<u32>(q > p ? q : p);

    for (let i: i32 = 0; i < z.length; ++i) {
      const lx = p > i ? unchecked(this._data[i]) : 0;
      const ly = q > i ? unchecked(rhs._data[i]) : 0;
      unchecked((z[i] = lx & ly));
    }

    return new MpZ(z);
  }

  // Exponse this?
  protected _andNot(rhs: MpZ): MpZ {
    const p = this.size;
    const q = rhs.size;
    const z = new StaticArray<u32>(q > p ? q : p);

    for (let i: i32 = 0; i < z.length; ++i) {
      const lx = p > i ? unchecked(this._data[i]) : 0;
      const ly = q > i ? unchecked(rhs._data[i]) : 0;
      unchecked((z[i] = ly === 0 ? lx : lx & ~ly));
    }

    return new MpZ(z);
  }

  /**
   * #### `#or(rhs: MpZ): MpZ`
   *
   * @returns the bitwise OR of `this` MpZ and `rhs`.
   *
   * > Note: The `#or` method returns the result of the bitwise `OR` as if the MpZ was a 2's complement signed integer; matching JavaScript's BigInt `|` operator.
   */
  or<T>(rhs: T): MpZ {
    const y = MpZ.from(rhs);
    if (!this.isNeg && !y.isNeg) return this._or(y);
    if (this.isNeg && y.isNeg) return this.not()._and(y.not()).not(); // x | y = ~(~x & ~y)
    if (this.isNeg) return this.not()._andNot(y).not(); // x | y = ~(~x & ~y)
    return y.not()._andNot(this).not(); // x | y = ~(~y & ~x)
  }

  protected _or(rhs: MpZ): MpZ {
    const p = this.size;
    const q = rhs.size;
    const z = new StaticArray<u32>(q > p ? q : p);

    for (let i: i32 = 0; i < z.length; ++i) {
      const lx = p > i ? unchecked(this._data[i]) : 0;
      const ly = q > i ? unchecked(rhs._data[i]) : 0;
      unchecked((z[i] = lx | ly));
    }

    return new MpZ(z);
  }

  /**
   * #### `#xor(rhs: MpZ): MpZ`
   *
   * @returns the bitwise XOR of `this` MpZ and `rhs`.
   *
   *  Note: The `#xor` method returns the result of the bitwise `XOR` as if the MpZ was a 2's complement signed integer; matching JavaScript's BigInt `^` operator.
   */
  xor<T>(rhs: T): MpZ {
    const y = MpZ.from(rhs);
    if (!this.isNeg && !y.isNeg) return this._xor(y);
    if (this.isNeg && y.isNeg) return this.not()._xor(y.not()); // x ^ y = ~x ^ ~y
    if (this.isNeg) return y._xor(this.not()).not(); // x ^ y = ~(y ^ ~x)
    return this._xor(y.not()).not(); // x ^ y = ~(x ^ ~y)
  }

  protected _xor(rhs: MpZ): MpZ {
    const p = this.size;
    const q = rhs.size;
    const z = new StaticArray<u32>(q > p ? q : p);

    for (let i: i32 = 0; i < z.length; ++i) {
      const lx = p > i ? unchecked(this._data[i]) : 0;
      const ly = q > i ? unchecked(rhs._data[i]) : 0;
      unchecked((z[i] = lx ^ ly));
    }

    return new MpZ(z);
  }

  // *** ToString ***

  /**
   * #### `#toString(radix: i32 = 10): string`
   *
   * @returns the value of `this` MpZ as a string. The radix can be from 2 and 36 (inclusive). The default radix is 10.  Negative numbers are prefixed with a `-`.  Negitive radix values return the result in uppercase.
   * @throws Error if the radix is not between 2 and 36.
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
      return this.isNeg ? `-${this.abs()._uhex()}` : this._uhex();
    } else if (radix >= 2 && radix <= 36) {
      return this.isNeg ? `-${this.abs()._uitoa(radix)}` : this._uitoa(radix);
    } else {
      throw new Error('toString() radix argument must be between 2 and 36');
    }
  }

  /**
   * #### `#toHex(): string`
   *
   * @returns the value of `this` MpZ as a hexadecimal string.
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
   * @returns the value of `this` MpZ as a decimal string.
   */
  toDecimal(): string {
    if (this.eqz()) return '0';
    return (this.isNeg ? `-` : '') + this.abs()._uitoaDecimal();
  }

  protected _uhex(): string {
    const s = new StaticArray<string>(2 * this.size - 1);

    let q = this.size;
    let i = 0;

    // MSB is not padded
    s[i++] = unchecked(this._data[--q]).toString(16);

    while (q > 0) {
      const x = unchecked(this._data[--q]).toString(16);
      s[i++] = '0'.repeat(8 - x.length); // padding
      s[i++] = x;
    }

    return s.join('');
  }

  protected _uitoaDecimal(): string {
    assert(
      ASC_NO_ASSERT || this.isNeg === false,
      '_uitoaDecimal: this must be positive'
    );

    if (this.size === 1) return this.toU32().toString(10);

    let n: MpZ = this;
    const k = (f64(this.size) / LOG2_10 / 9) * LIMB_BITS;
    let i = 2 * u32(k) + 1;
    const s = new StaticArray<string>(i);

    while (n.compareTo(TO_DECIMAL_N) === 1) {
      const d = n._udivRemU32(TO_DECIMAL_N);
      n = d.div;

      const x = d.rem.toString(10);
      s[--i] = x;
      s[--i] = '0'.repeat(DIGITS_PER_LIMB - x.length);
    }

    if (!n.eqz()) {
      s[--i] = n.toU32().toString(10);
    }

    return s.join('');
  }

  protected _uitoa(base: u32): string {
    assert(ASC_NO_ASSERT || base >= 2, '_uitoa: base must be >= 2');
    assert(ASC_NO_ASSERT || base <= 36, '_uitoa: base must be <= 36');
    assert(
      ASC_NO_ASSERT || this.isNeg === false,
      '_uitoa: this must be positive'
    );

    const s = new Array<string>();

    let n: MpZ = this;
    while (n.compareTo(base) === 1) {
      const d = n._udivRemU32(base);
      n = d.div;
      s.unshift(d.rem.toString(base));
    }

    if (!n.eqz()) {
      s.unshift(n.toU32().toString(base));
    }

    return s.join('');
  }

  // *** valueOf/toString ***

  /**
   * #### `#valueOf(): number`
   *
   * @returns the value of `this` MpZ as a `number`.
   */
  valueOf(): number {
    const q = this.size;
    const l1: u64 = unchecked(this._data[q - 1]);
    const z0 = f64(l1) * f64(BASE) ** (q - 1);
    const l2: u64 = q > 1 ? unchecked(this._data[q - 2]) : 0;
    const z1 = f64(l2) * f64(BASE) ** (q - 2);
    const z = z0 + z1;
    return this.isNeg ? -z : z;
  }

  /**
   * #### `#toExponential(n: u32): string`
   *
   * @returns the value of `this` MpZ as a string in exponential notation.
   * If `this` MpZ has more digits than requested, the number is rounded to the nearest number represented by `n` digits.
   */
  toExponential(fractionDigits: u32 = 0): string {
    if (this.eqz()) {
      const s = fractionDigits === 0 ? '0' : '0.'.padEnd(fractionDigits, '0');
      return `${s}e+0`;
    }

    const sgn = this.isNeg ? '-' : '';

    let x = this.abs();
    let e = x.log10().toU32();

    if (e > fractionDigits) {
      // Handle rounding
      const m = MpZ.TEN.pow(e - fractionDigits - 1);
      x = x.div(m);
      x = x.add(5).div(10);
    }

    const z = x.toDecimal();
    if (u32(z.length) > fractionDigits + 1) e++; // Rounding caused a carry

    const ip = z.charAt(0);
    if (fractionDigits === 0) return `${sgn}${ip}e+${e}`;

    const fp = z.slice(1, fractionDigits + 1).padEnd(fractionDigits, '0');
    return `${sgn}${ip}.${fp}e+${e}`;
  }

  /**
   * #### `#toU32Array(): u32[]`
   *
   * @returns the value of `this` MpZ as an unsigned 32-bit integer array.  Ther sign of the MpZ is ignored.
   */
  toArray(): u32[] {
    return this._data.slice<u32[]>(0, this.size);
  }

  /**
   * #### `#toU32(): u32`
   *
   * @returns the value of `this` MpZ as an unsigned 32-bit integer.  If `this` MpZ is too big to fit in an int32, only the low-order 32 bits are returned.
   * If `this` MpZ is negative, the returned value is the 2's complement representation of the MpZ.
   */
  toU32(): u32 {
    const z = unchecked(this._data[0]);
    return this.isNeg ? -z : z;
  }

  /**
   * #### `#toI32(): i32`
   *
   * @returns the value of `this` MpZ as a signed 32-bit integer.  If `this` MpZ is too big to fit in an int32, only the low-order 32 bits are returned.
   */
  toI32(): i32 {
    const z = unchecked(this._data[0]);
    return this.isNeg ? -z : z;
  }

  /**
   * #### `#toU64(): u64`
   *
   * @returns the value of `this` MpZ as an unsigned 64-bit integer.  If `this` MpZ is too big to fit in an int64, only the low-order 64 bits are returned.
   */
  toU64(): u64 {
    const z =
      this.size === 1
        ? u64(unchecked(this._data[0]))
        : (u64(unchecked(this._data[1])) << 32) + u64(unchecked(this._data[0]));
    return this.isNeg ? -z : z;
  }

  protected _toU64_safe(): u64 {
    if (this.size > 3) {
      throw new RangeError('MpZ too large to fit in u64');
    }
    return this.toU64();
  }

  /**
   * #### `#toI64(): i64`
   *
   * @returns the value as a signed 64-bit integer.  If `this` MpZ is too big to fit in an int64, only the low-order 64 bits are returned.
   */
  toI64(): i64 {
    const z =
      this.size === 1
        ? u64(unchecked(this._data[0]))
        : (u64(unchecked(this._data[1])) << 32) + u64(unchecked(this._data[0]));
    return this.isNeg ? -z : z;
  }

  // aka mod_power_of_two
  // bitwise_modulo_power_of_two
  protected _truncateToNBits(bits: u64): MpZ {
    if (bits === 0) return MpZ.ZERO;

    const isNeg = this.isNeg;
    const limbs = <i32>(bits / LIMB_BITS);
    if (!isNeg && limbs >= this.size) return this;

    const x = isNeg ? this.not() : this;

    const p = x.size;
    let q: i32 = limbs + 1;
    const z = new StaticArray<u32>(q);

    for (let i: i32 = 0; i < q; ++i) {
      const lx = p > i ? unchecked(x._data[i]) : 0;
      unchecked((z[i] = isNeg ? ~lx : lx));
    }

    const n = <u32>(bits % LIMB_BITS);
    z[limbs] &= (1 << n) - 1;

    return new MpZ(z);
  }

  // *** Comparison ***

  /**
   * #### `#eqz(): boolean`
   *
   * @returns `true` if `this` MpZ is equal to zero.
   */
  eqz(): boolean {
    return this.size === 1 && unchecked(this._data[0]) === 0;
  }

  /**
   * #### `#compareTo(rhs: MpZ | i32 | u32 | i64 | u64 | string): i32`
   *
   * @returns `-1` if `this` MpZ is less than the rhs, `0` if `this` MpZ is equal to the rhs, or `1` if `this` MpZ is greater than the rhs.
   */
  compareTo<T>(rhs: T): i32 {
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
   * @returns `true` if `this` MpZ is equal to the rhs.
   */
  eq<T>(rhs: T): boolean {
    return this.compareTo(MpZ.from(rhs)) === 0;
  }

  /**
   * #### `#ne(rhs: MpZ | i32 | u32 | i64 | u64 | string): boolean`
   *
   * @returns `true` if `this` MpZ is not equal to the rhs.
   */
  ne<T>(rhs: T): boolean {
    return this.compareTo(MpZ.from(rhs)) !== 0;
  }

  /**
   * #### `#gt(rhs: MpZ | i32 | u32 | i64 | u64 | string): boolean`
   *
   * @returns `true` if `this` MpZ is greater than the rhs.
   */
  gt<T>(rhs: T): boolean {
    return this.compareTo(MpZ.from(rhs)) > 0;
  }

  /**
   * #### `#ge(rhs: MpZ | i32 | u32 | i64 | u64 | string): boolean`
   *
   * @returns `true` if `this` MpZ is greater than or equal to the rhs.
   */
  ge<T>(rhs: T): boolean {
    return this.compareTo(MpZ.from(rhs)) >= 0;
  }

  /**
   * #### `#lt(rhs: MpZ | i32 | u32 | i64 | u64 | string): boolean`
   *
   * @returns `true` if `this` MpZ is less than the rhs.
   */
  lt<T>(rhs: T): boolean {
    return this.compareTo(MpZ.from(rhs)) < 0;
  }

  /**
   * #### `#le(rhs: MpZ | i32 | u32 | i64 | u64 | string): boolean`
   *
   * @returns `true` if `this` MpZ is less than or equal to the rhs.
   */
  le<T>(rhs: T): boolean {
    return this.compareTo(MpZ.from(rhs)) <= 0;
  }

  /**
   * #### Static values
   *
   * The following static values are provided for convenience:
   * - `MpZ.ZERO` - The MpZ value `0`.
   * - `MpZ.ONE` - The MpZ value `1`.
   * - `MpZ.TWO` - The MpZ value `2`.
   * - `MpZ.TEN` - The MpZ value `10`.
   */
  static readonly ZERO: MpZ = new MpZ([0]);
  static readonly ONE: MpZ = new MpZ([1]);
  static readonly TWO: MpZ = new MpZ([2]);
  static readonly TEN: MpZ = new MpZ([10]);

  /**
   * ### Operators
   */

  /**
   * #### Unary `-` operator
   *
   * @returns the negation of `this` MpZ (`-this`).
   */
  @operator.prefix('-')
  static neg(lhs: MpZ): MpZ {
    return lhs.negate();
  }

  /**
   * #### Binary `+`, `-`, `*`, `/` operators
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
   * @returns the remainder of the lhs and rhs (`lhs % rhs`).
   * @throws RangeError if `rhs` is zero.
   *
   * > Note: The `%` operator is not the same as the `#mod` method. The `%` operator returns the `#rem` of the division of the lhs and rhs; matching JavaScript's BigInt `%` operator.
   */
  // @ts-ignore
  @inline
  @operator('%')
  static mod(lhs: MpZ, rhs: MpZ): MpZ {
    return lhs._rem(rhs);
  }

  /**
   * #### `**` operator
   *
   * @returns the power of the lhs to the rhs (`lhs ** rhs`).
   */
  // @ts-ignore
  @inline
  @operator('**')
  static pow(lhs: MpZ, rhs: MpZ): MpZ {
    return lhs.pow(rhs);
  }

  /**
   * #### `<<`, `>>` operators
   *
   * @returns the result of the left/right shift of the lhs by the rhs.  Negitive rhs values will result in a opposite shift.
   * @throws RangeError if the result exceeds the maximum MpZ size.
   *
   * > Shift operators behave as if they were represented in two's-complement notation; like JavaScripts's `<<` and `>>` operators.
   */

  // @ts-ignore
  @operator('<<')
  static shiftLeft(lhs: MpZ, rhs: MpZ): MpZ {
    return lhs.shiftLeft(rhs);
  }

  // @ts-ignore
  @operator('>>')
  static shiftRight(lhs: MpZ, rhs: MpZ): MpZ {
    return lhs.shiftRight(rhs);
  }

  /**
   * #### `~` operator
   *
   * @returns the bitwise NOT of `this` MpZ (`~this`).
   */
  @operator.prefix('~')
  static not(lhs: MpZ): MpZ {
    return lhs.not();
  }

  /**
   * #### `&`, `|`, `^ operators
   *
   * @returns the bitwise `AND`, `OR`, `XOR` operation on the two operands.
   *
   * > This operator returns the result of the bitwise `AND`, `OR`, `XOR` as if the values were 2's complement signed integers; matching JavaScript's BigInt `&`, `|`, `^` operators.
   */

  // @ts-ignore
  @operator('&')
  static and(lhs: MpZ, rhs: MpZ): MpZ {
    return lhs.and(rhs);
  }

  // @ts-ignore
  @operator('|')
  static or(lhs: MpZ, rhs: MpZ): MpZ {
    return lhs.or(rhs);
  }

  // @ts-ignore
  @operator('^')
  static xor(lhs: MpZ, rhs: MpZ): MpZ {
    return lhs.xor(rhs);
  }

  /**
   * ### `!` operator
   *
   * @returns the logical NOT of `this` MpZ (`!this`).  This is equivalent to `#eqz()`.
   */
  @operator.prefix('!')
  static logicalNot(lhs: MpZ): boolean {
    return lhs.eqz();
  }

  /**
   * #### `MpZ.asIntN(bits: u32, a: MpZ): MpZ`
   *
   * @returns a BigInt value truncated to the given number of least significant bits and returns that value as a signed integer.
   * If the leading bit of the remaining number is 1, the result is negative.
   */
  static asIntN(bits: u32, a: MpZ): MpZ {
    if (bits === 0) return MpZ.ZERO;
    const isNeg = a._getBit(bits - 1);
    return isNeg
      ? a.negate()._truncateToNBits(bits).negate()
      : a._truncateToNBits(bits);
  }

  /**
   * ### `MpZ.asUintN(bits: u32, a: MpZ): MpZ`
   *
   * @returns a BigInt value truncated to the given number of least significant bits and returns that value as an unsigned integer.
   * Results are always non-negative and two's complement in binary.
   */
  static asUintN(bits: u32, a: MpZ): MpZ {
    return a._truncateToNBits(bits);
  }

  /**
   * #### `MpZ.random(bits: u64): MpZ`
   *
   * @returns a random MpZ value with the specified maximum number of bits.
   * @throws RangeError if `bits` exceeds the maximum MpZ size.
   */
  static random(bits: u64): MpZ {
    const b = u32(bits % 32);
    const limbs = <u32>(bits / LIMB_BITS) + <bool>(b > 0);
    if (limbs > MAX_LIMBS) throw new RangeError('Maximum MpZ size exceeded');

    const n = new StaticArray<u32>(limbs);
    for (let i: u32 = 0; i < limbs; ++i) {
      n[i] = u32(Math.random() * u32.MAX_VALUE);
    }
    if (b > 0) {
      const m = (1 << b) - 1;
      n[n.length - 1] &= m;
    }
    return new MpZ(n);
  }
}
