// @ts-ignore
@inline
const LOW_MASK: u32 = 0xffffffff;

// @ts-ignore
@inline
const LIMB_BITS: u32 = 32;

// @ts-ignore
@inline
const BASE: u64 = 1 << LIMB_BITS;

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
  const neg = value < 0;
  if (value < 0) {
    value = -value;
  }
  return fromU64(<u64>value, neg);
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

  let r: MpZ;
  if (base === 10) {
    r = fromStringU(value, 10);
  } else {
    r = fromStringU(value.substr(2), base);
  }

  return neg ? r.neg() : r;
}

function u32ToHex(value: u32, pad: boolean = true): string {
  let r = value.toString(16);
  if (!pad) return r;
  return ('00000000' + r).substr(r.length);
}

// TODO: ctz
// TODO: shl(MpZ)
// TODO: shr(MpZ)
// TODO: log
// TODO: sqrt
// TODO: fused arithmetic
// TODO: bitwise operators

// Constants for decimal conversion
const TO_DECIMAL_M = 9;
const TO_DECIMAL_N = 10 ** TO_DECIMAL_M;
const TO_DECIMAL_P = '0'.repeat(TO_DECIMAL_M);

export class DivRem<R> {
  div!: MpZ;
  rem!: R;
}

// @ts-ignore
@final
export class MpZ {
  // Contains the size of the MpZ and the sign
  // The sign is stored as the negation of the size
  // This size excludes leading zero limbs (except for least significant limb)
  protected readonly _size: i32;

  // Contains the limbs of the MpZ
  // The last limb is the most significant
  // The first limb is the least significant
  // The most significant limb may be zero, never use _data.length to get the size
  protected readonly _data: StaticArray<u32>;

  // Should not be used directly
  // Mutating _data will cause unexpected behavior
  constructor(_data: StaticArray<u32>, _neg: boolean = false) {
    let size = _data.length;

    // Reduce size by leading zeros
    while (size > 1 && unchecked(_data[size - 1] === 0)) {
      size--;
    }

    if (size === 0) {
      this._data = [0];
      this._size = 1;
    } else {
      this._data = _data;
      this._size = _neg ? -size : size;
    }
  }

  // @ts-ignore
  @inline
  get isNeg(): boolean {
    return this._size < 0;
  }

  // @ts-ignore
  @inline
  get size(): i32 {
    return this.isNeg ? -this._size : this._size;
  }

  abs(): MpZ {
    return this.isNeg ? new MpZ(this._data) : this;
  }

  // *** Addition ***

  add<T>(_rhs: T): MpZ {
    const rhs = MpZ.from(_rhs);
    if (this.isNeg && rhs.isNeg) return this._uadd(rhs).neg(); // -a + -b = -(a + b)
    if (this.isNeg) return rhs._usub(this); // -a + b = b - a
    if (rhs.isNeg) return this._usub(rhs); // a + -b = a - b
    if (rhs.size === 1) return this._uaddU32(unchecked(rhs._data[0]));
    if (this.size === 1) return rhs._uaddU32(unchecked(this._data[0]));
    return this._uadd(rhs);
  }

  // unsigned addition
  // assumes values are positive
  protected _uadd(rhs: MpZ): MpZ {
    return this.size < rhs.size ? rhs.__uadd(this) : this.__uadd(rhs); // a + b = b + a
  }

  // unsigned addition
  // ordered such that Size(lhs) > Size(rhs)
  // assumes values are positive
  protected __uadd(rhs: MpZ): MpZ {
    const q = this.size;
    const result = new StaticArray<u32>(q + 1);

    let carry: u64 = 0;
    for (let i: i32 = 0; i < q; ++i) {
      const lhs_limb = unchecked(this._data[i]);
      const rhs_limb = rhs.size > i ? unchecked(rhs._data[i]) : 0;
      carry += u64(lhs_limb) + u64(rhs_limb);
      unchecked((result[i] = LOW(carry)));
      carry = HIGH(carry);
    }
    unchecked((result[q] = LOW(carry)));

    return new MpZ(result);
  }

  // unsigned addition by uint32
  // assumes values are positive
  protected _uaddU32(rhs: u32): MpZ {
    const q = this.size;
    const result = new StaticArray<u32>(q + 1);

    let carry: u32 = rhs;
    for (let i: i32 = 0; i < q; ++i) {
      unchecked((result[i] = carry + this._data[i]));
      carry = unchecked(result[i] < this._data[i]) ? 1 : 0;
    }
    unchecked((result[q] = carry));
    return new MpZ(result);
  }

  // *** Subtraction ***

  sub<T>(_rhs: T): MpZ {
    const rhs = MpZ.from(_rhs);

    const s_lhs = this.isNeg;
    const s_rhs = rhs.isNeg;

    if (s_lhs && s_rhs) return rhs._usub(this); // -a - -b = b - a
    if (s_lhs) return this._uadd(rhs).neg(); // -a - b = -(a + b)
    if (s_rhs) return this._uadd(rhs); // a - -b = a + b
    return this._usub(rhs);
  }

  // unsigned subtraction
  // assumes values are positive
  protected _usub(rhs: MpZ): MpZ {
    if (this._ucmp(rhs) < 0) return rhs._usub(this).neg(); // a - b = -(b - a)
    if (rhs.size === 1) return this.__usub32(unchecked(rhs._data[0]));
    return this.__usub(rhs);
  }

  // unsigned sub
  // ordered such that lhs >= rhs
  // assumes values are positive
  protected __usub(rhs: MpZ): MpZ {
    const q = this.size;
    const result = new StaticArray<u32>(q);

    let borrow: i64 = 0;
    for (let i: i32 = 0; i < q; ++i) {
      const lhs_limb = unchecked(this._data[i]);
      const rhs_limb = rhs.size > i ? unchecked(rhs._data[i]) : 0;

      borrow = i64(lhs_limb) - i64(rhs_limb) - borrow;
      unchecked((result[i] = LOW(borrow)));
      borrow = borrow < 0 ? 1 : 0;
    }
    return new MpZ(result);
  }

  // unsigned sub by uint32
  // assumes values are positive
  protected __usub32(rhs: u32): MpZ {
    const q = this.size;
    const result = new StaticArray<u32>(q);

    let borrow: u32 = rhs;
    for (let i: i32 = 0; i < q; ++i) {
      const lhs_limb = unchecked(this._data[i]);

      unchecked((result[i] = lhs_limb - borrow));
      borrow = borrow > lhs_limb ? 1 : 0;
    }

    return new MpZ(result);
  }

  // *** Multiplication ***

  mul<T>(_rhs: T): MpZ {
    const rhs = MpZ.from(_rhs);
    if (this.eqz() || rhs.eqz()) return MpZ.ZERO;
    if (this.eq(MpZ.ONE)) return rhs;
    if (rhs.eq(MpZ.ONE)) return this;

    const s_lhs = this.size;
    const s_rhs = rhs.size;

    let r: MpZ;

    if (s_rhs === 1) {
      r = this._umulU32(unchecked(rhs._data[0]));
    } else if (s_lhs === 1) {
      r = rhs._umulU32(unchecked(this._data[0]));
    } else {
      r = this._umul(rhs);
    }

    return this.isNeg !== rhs.isNeg ? r.neg() : r;
  }

  // unsigned mul
  // assumes values are positive
  protected _umul(rhs: MpZ): MpZ {
    const q = this.size;
    const p = rhs.size;
    const result = new StaticArray<u32>(q + p);

    for (let i: i32 = 0; i < q; ++i) {
      let carry: u64 = 0;
      for (let j: i32 = 0; j < p; ++j) {
        const k = i + j;
        carry +=
          u64(unchecked(this._data[i])) * u64(unchecked(rhs._data[j])) +
          u64(unchecked(result[k]));
        unchecked((result[k] = LOW(carry)));
        carry = HIGH(carry);
      }
      unchecked((result[i + p] = LOW(carry)));
    }

    return new MpZ(result);
  }

  // unsigned square
  // assumes values are positive
  // TODO: optimize for aij = aji
  protected _usqr(): MpZ {
    const q = this.size;
    const result = new StaticArray<u32>(q * 2);

    for (let i: i32 = 0; i < q; ++i) {
      let carry: u64 = 0;
      for (let j: i32 = 0; j < q; ++j) {
        const k = i + j;
        carry +=
          u64(unchecked(this._data[i])) * u64(unchecked(this._data[j])) +
          u64(unchecked(result[k]));
        unchecked((result[k] = LOW(carry)));
        carry = HIGH(carry);
      }
      unchecked((result[i + q] = LOW(carry)));
    }

    return new MpZ(result);
  }

  // unsigned multiply by uint32
  // assumes values are positive
  protected _umulU32(rhs: u32): MpZ {
    const q = this.size;
    const result = new StaticArray<u32>(q + 1);

    let carry: u64 = 0;
    for (let i: i32 = 0; i < q; ++i) {
      carry += u64(unchecked(this._data[i])) * u64(rhs);
      unchecked((result[i] = LOW(carry)));
      carry = HIGH(carry);
    }
    unchecked((result[q] = LOW(carry)));

    return new MpZ(result);
  }

  // unsigned mul by power of 2
  // assumes values are positive
  protected _umul2powU32(rhs: u32): MpZ {
    const q = this.size;
    const result = new StaticArray<u32>(q + 1);

    let carry: u64 = 0;
    for (let i: i32 = 0; i < q; ++i) {
      carry += u64(unchecked(this._data[i])) << rhs;
      unchecked((result[i] = LOW(carry)));
      carry = HIGH(carry);
    }
    unchecked((result[q] = LOW(carry)));

    return new MpZ(result);
  }

  // *** Shifts ***

  // count leading zeros
  protected _clz(): u32 {
    const d = unchecked(this._data[this.size - 1]);
    return <u32>clz(d);
  }

  // count bits
  protected _bits(): u32 {
    return <u32>(this.size * LIMB_BITS - this._clz());
  }

  protected _limbShiftLeft(n: u32): MpZ {
    assert(
      ASC_NO_ASSERT || n < u32(i32.MAX_VALUE),
      '_bitShiftRight: n must be less than i32.MAX_VALUE',
    );
    assert(ASC_NO_ASSERT || n >= 0, '_bitShiftRight: n must be > 0');

    if (n === 0) return this;
    const data = this._data.slice();
    const low = new StaticArray<u32>(n);
    return new MpZ(StaticArray.fromArray<u32>(low.concat(data)));
  }

  protected _limbShiftRight(n: u32): MpZ {
    assert(
      ASC_NO_ASSERT || u32(i32.MAX_VALUE),
      '_bitShiftRight: n must be less than i32.MAX_VALUE',
    );
    assert(ASC_NO_ASSERT || n >= 0, '_bitShiftRight: n must be > 0');

    if (n === 0) return this;
    if (n >= <u32>this.size) return MpZ.ZERO;
    const data = this._data.slice(n);
    return new MpZ(StaticArray.fromArray<u32>(data));
  }

  protected _bitShiftLeft(n: u32): MpZ {
    assert(
      ASC_NO_ASSERT || n < LIMB_BITS,
      '_bitShiftLeft: n must be less than LIMB_BITS',
    );
    assert(ASC_NO_ASSERT || n >= 0, '_bitShiftRight: n must be > 0');

    return n === 0 ? this : this._umul2powU32(n);
  }

  protected _bitShiftRight(n: u32): MpZ {
    assert(
      ASC_NO_ASSERT || n < LIMB_BITS,
      '_bitShiftRight: n must be less than LIMB_BITS',
    );
    assert(ASC_NO_ASSERT || n >= 0, '_bitShiftRight: n must be > 0');

    return n === 0 ? this : this._udivPow2(n);
  }

  // unsigned divide by power of 2
  protected _udivPow2(n: u32): MpZ {
    const q = this.size;
    const result = new StaticArray<u32>(q);
    const n2 = 2 ** n;

    let rem: u64 = 0;
    for (let i: i32 = this.size - 1; i >= 0; --i) {
      rem = u64(unchecked(this._data[i])) + (rem << 32);
      unchecked((result[i] = LOW(rem >> n)));
      rem %= n2;
    }

    return new MpZ(result);
  }

  // divide by 2
  // assumes values is positive
  protected _udiv2(): MpZ {
    const q = this.size;
    const result = new StaticArray<u32>(q);

    let rem: u32 = 0;
    for (let i: i32 = this.size - 1; i >= 0; --i) {
      const d = unchecked(this._data[i]);
      unchecked((result[i] = (d >> 1) + (rem << 31)));
      rem = d % 2;
    }

    return new MpZ(result);
  }

  protected _ushl(n: u64): MpZ {
    // umul_pow2
    assert(
      ASC_NO_ASSERT || n < LIMB_BITS * i32.MAX_VALUE,
      '_ushr: rhs must be < 32*i32.MAX_VALUE',
    );
    assert(ASC_NO_ASSERT || n >= 0, '_ushr: rhs must be > 0');

    if (n === 0) return this;
    return this._limbShiftLeft(u32(n / LIMB_BITS))._bitShiftLeft(
      u32(n % LIMB_BITS),
    );
  }

  protected _ushr(n: u64): MpZ {
    // udiv_pow2
    assert(
      ASC_NO_ASSERT || n < LIMB_BITS * i32.MAX_VALUE,
      '_ushr: rhs must be < 32*i32.MAX_VALUE',
    );
    assert(ASC_NO_ASSERT || n >= 0, '_ushr: rhs must be > 0');

    if (n === 0) return this;
    return this._limbShiftRight(u32(n / LIMB_BITS))._bitShiftRight(
      u32(n % LIMB_BITS),
    );
  }

  // @ts-ignore
  // logical left shift (rename mul_pow2)
  shl(n: i32): MpZ {
    // TODO: support > i32 check if (n / LIMB_BITS) > MaxInt
    if (n === 0) return this;
    if (this.eqz()) return MpZ.ZERO;
    if (n < 0) return this.shr(-n);
    return this.isNeg ? this._ushl(n).neg() : this._ushl(n);
  }

  // @ts-ignore
  // logical right shift (rename div_pow2)
  // Note: this is not arithmetic shift (unlike JavaScript)
  shr(n: i32): MpZ {
    // TODO: support > i32
    if (n === 0) return this;
    if (this.eqz()) return MpZ.ZERO;
    if (n < 0) return this.shl(-n);
    return this.isNeg ? this._ushr(n).neg() : this._ushr(n);
  }

  // *** Division ***

  // floored division
  div<T>(_rhs: T): MpZ {
    if (this.eqz()) return MpZ.ZERO;

    const rhs = MpZ.from(_rhs);

    if (rhs.eqz()) throw new RangeError('Divide by zero');
    if (rhs.eq(MpZ.ONE)) return this; // x / 1 = x
    if (this.eq(rhs)) return MpZ.ONE; // x / x = 1

    const s_lhs = this.isNeg;
    const s_rhs = rhs.isNeg;

    const dividend = this.abs();
    const divisor = rhs.abs();

    if (dividend.lt(divisor)) return MpZ.ZERO; // ⌊x / y⌋ = 0 if x < y

    const neg = s_lhs !== s_rhs;

    if (divisor.size === 1) {
      const r = dividend._udivU32(unchecked(divisor._data[0]));
      return neg ? r.neg() : r;
    }

    const p = dividend._udiv(divisor);
    return neg ? p.neg() : p;
  }

  // unsigned divide, lhs > rhs
  // Donald Knuth’s Algorithm D
  protected _udiv(rhs: MpZ): MpZ {
    assert(ASC_NO_ASSERT || this > rhs, '_udiv: lhs must be greater than rhs');

    const m = this.size;
    const n = rhs.size;
    const result = new StaticArray<u32>(m - n + 1);

    // D1. [Normalize]
    // Normalize by shifting rhs left just enough so that
    // its high-order bit is on, and shift lhs left the
    // same amount.
    const s = rhs._clz();
    const un = this._ushl(s).toArray();
    const vn = rhs._ushl(s).toArray();

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
      const h: u64 =
        unchecked(u64(un[j + n]) << 32) + unchecked(u64(un[j + n - 1]));
      const v = unchecked(u64(vn[n - 1]));
      let qhat: u64 = h / v;
      let rhat: u64 = h % v;

      const vn_n_2 = unchecked(u64(vn[n - 2]));
      const un_j_n_2 = unchecked(u64(un[j + n - 2]));
      const vn_n_1 = unchecked(u64(vn[n - 1]));

      while (true) {
        if (qhat >= BASE || LOW(qhat) * vn_n_2 > (rhat << 32) + un_j_n_2) {
          qhat -= 1;
          rhat += vn_n_1;
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
      unchecked((un[j + n] = LOW((t = u64(un[j + n]) - k))));

      // D5. [Test remainder]
      unchecked((result[j] = LOW(qhat))); // Store quotient digit.
      if (t < 0) {
        // D6. [Add back]

        // If we subtracted too much, add back.
        result[j] -= 1;
        k = 0;
        for (let i = 0; i < n; i++) {
          t = unchecked(u64(un[i + j]) + u64(vn[i])) + k;
          unchecked((un[i + j] = LOW(t)));
          k = t >> 32;
        }
        unchecked((un[j + n] = LOW(u64(un[j + n]) + k)));
      }
    }
    return new MpZ(result);
  }

  // unsigned divide by uint32
  // assumes values are positive
  protected _udivU32(rhs: u32): MpZ {
    const q = this.size;
    const r = new StaticArray<u32>(q);

    let rem: u64 = 0;
    for (let i: i32 = this.size - 1; i >= 0; --i) {
      rem = u64(unchecked(this._data[i])) + u64(rem << 32);
      unchecked((r[i] = LOW(rem / rhs)));
      rem %= rhs;
    }

    return new MpZ(r);
  }

  protected _udivRemU32(rhs: u32): DivRem<u32> {
    assert(ASC_NO_ASSERT || !this.isNeg, '_udivRemU32: lhs must be positive');

    const q = this.size;
    const result = new StaticArray<u32>(q);

    let rem: u64 = 0;
    for (let i: i32 = this.size - 1; i >= 0; --i) {
      rem = u64(unchecked(this._data[i])) + (rem << 32);
      unchecked((result[i] = LOW(rem / rhs)));
      rem %= rhs;
    }

    const d = new MpZ(result);
    const r = LOW(rem);
    return { div: d, rem: r };
  }

  // *** Modulus ***

  // modulus
  mod<T>(_rhs: T): MpZ {
    const rem = this.rem(_rhs);
    return rem.add(_rhs).rem(_rhs); // ((n % d) + d) % d
  }

  // remainder
  rem<T>(_rhs: T): MpZ {
    const rhs = MpZ.from(_rhs);
    const q = this.div(rhs);
    return this.sub(rhs.mul(q));
  }

  // *** Pow ***

  pow<T>(_rhs: T): MpZ {
    const rhs = MpZ.from(_rhs);
    if (rhs.isNeg) return MpZ.ZERO;

    if (rhs.eqz()) return MpZ.ONE;
    if (rhs.eq(MpZ.ONE)) return this;
    if (this.eqz()) return MpZ.ZERO;
    if (this.eq(MpZ.ONE)) return MpZ.ONE;

    const neg = this.isNeg && rhs.isOdd();
    const p =
      rhs.size === 1 ? this._upowU32(unchecked(rhs._data[0])) : this._upow(rhs);
    return neg ? p.neg() : p;
  }

  // unsigned pow
  // exponentiation by squaring (modified)
  // ignores sign of base and exponent
  protected _upow(rhs: MpZ): MpZ {
    let result = MpZ.ONE;
    let lhs: MpZ = this;

    const len = rhs.size;
    for (let i: i32 = 0; i < len; ++i) {
      let limb = unchecked(rhs._data[i]);

      for (let j: u32 = 0; j < LIMB_BITS; ++j) {
        if (limb & 1) {
          result = result._umul(lhs);
        }

        limb >>= 1;
        if (limb === 0 && i === len - 1) break;
        lhs = lhs._usqr();
      }
    }

    return result;
  }

  // Exponentiation by squaring
  // Ignores sign of base and exponent
  protected _upowU32(rhs: u32): MpZ {
    let result = MpZ.ONE;
    let lhs: MpZ = this;

    while (true) {
      if (rhs & 1) {
        result = result._umul(lhs);
      }

      rhs >>= 1;
      if (rhs === 0) break;
      lhs = lhs._usqr();
    }

    return result;
  }

  isOdd(): boolean {
    return (unchecked(this._data[0]) & 1) === 1;
  }

  isEven(): boolean {
    return (unchecked(this._data[0]) & 1) === 0;
  }

  // @ts-ignore
  @operator.prefix('-')
  neg(): MpZ {
    if (this.eqz()) return this;
    return new MpZ(this._data, !this.isNeg);
  }

  // *** ToString ***
  toString(radix: i32 = 10): string {
    if (radix < -2) {
      return this.toString(-radix).toUpperCase();
    }

    if (radix === 10) {
      return this.toDecimal();
    } else if (radix === 16) {
      return this.isNeg ? `-${this._uhex()}` : `${this._uhex()}`;
    } else if (radix >= 2 && radix <= 36) {
      return this._uitoa(radix);
    } else {
      throw new Error('toString() radix argument must be between 2 and 36');
    }
  }

  toHex(): string {
    if (this.eqz()) return '0x0';

    const r = this._uhex();
    return this.isNeg ? `-0x${r}` : `0x${r}`;
  }

  toDecimal(): string {
    if (this.eqz()) return '0';
    return (this.isNeg ? `-` : '') + this.abs()._uitoaDecimal();
  }

  protected _uhex(): string {
    let r = '';

    for (let i: i32 = this.size - 1; i >= 0; --i) {
      r += u32ToHex(unchecked(this._data[i]), i !== this.size - 1);
    }

    return r;
  }

  protected _uitoaDecimal(): string {
    const dec = new Array<string>();

    let n: MpZ = this;
    while (n.cmp(TO_DECIMAL_N) === 1) {
      const d = n._udivRemU32(TO_DECIMAL_N);
      n = d.div;

      const s = TO_DECIMAL_P + d.rem.toString(10);
      dec.unshift(s.slice(-TO_DECIMAL_M));
    }

    if (!n.eqz()) {
      dec.unshift(n.toU32().toString(10));
    }

    return dec.join('');
  }

  protected _uitoa(base: u32): string {
    const dec = new Array<string>();

    let n: MpZ = this;
    while (n.cmp(base) === 1) {
      const d = n._udivRemU32(base);
      n = d.div;
      dec.unshift(d.rem.toString(base));
    }

    if (!n.eqz()) {
      dec.unshift(n.toU32().toString(base));
    }

    return dec.join('');
  }

  // *** ToValue ***
  toValue(): number {
    const n = this.size;
    const l1: u64 = unchecked(this._data[n - 1]);
    const r1 = f64(l1) * f64(BASE) ** (n - 1);
    const l2: u64 = n > 1 ? unchecked(this._data[n - 2]) : 0;
    const r2 = f64(l2) * f64(BASE) ** (n - 2);
    return r1 + r2;
  }

  toArray(): u32[] {
    return this._data.slice<u32[]>(0, this.size);
  }

  toU32(): u32 {
    return unchecked(this._data[0]);
  }

  toI32(): i32 {
    return this.isNeg ? -unchecked(this._data[0]) : unchecked(this._data[0]);
  }

  toU64(): u64 {
    return this.size === 1
      ? u64(unchecked(this._data[0]))
      : (u64(unchecked(this._data[1])) << 32) + u64(unchecked(this._data[0]));
  }

  toI64(): i64 {
    return this.isNeg ? -this.toU64() : this.toU64();
  }

  // *** Comparison ***

  // equal to zero
  eqz(): boolean {
    return this.size === 1 && unchecked(this._data[0]) === 0;
  }

  // compare
  cmp<T>(_rhs: T): i32 {
    const rhs = MpZ.from(_rhs);

    const lhs_s = this.isNeg;
    const rhs_s = rhs.isNeg;

    if (lhs_s !== rhs_s) return lhs_s ? -1 : 1; // -a < b

    const c = this._ucmp(rhs);

    return lhs_s ? -c : c;
  }

  // unsigned compare
  protected _ucmp(rhs: MpZ): i32 {
    const lhs_s = this.size;
    const rhs_s = rhs.size;

    if (lhs_s !== rhs_s) return lhs_s > rhs_s ? 1 : -1;
    for (let i = lhs_s - 1; i >= 0; i--) {
      const lhs_v = unchecked(this._data[i]);
      const rhs_v = unchecked(rhs._data[i]);
      if (lhs_v != rhs_v) {
        return lhs_v > rhs_v ? 1 : -1;
      }
    }
    return 0;
  }

  eq<T>(rhs: T): boolean {
    return this.cmp(MpZ.from(rhs)) === 0;
  }

  neq<T>(rhs: T): boolean {
    return this.cmp(MpZ.from(rhs)) !== 0;
  }

  gt<T>(rhs: T): boolean {
    return this.cmp(MpZ.from(rhs)) > 0;
  }

  gte<T>(rhs: T): boolean {
    return this.cmp(MpZ.from(rhs)) >= 0;
  }

  lt<T>(rhs: T): boolean {
    return this.cmp(MpZ.from(rhs)) < 0;
  }

  lte<T>(rhs: T): boolean {
    return this.cmp(MpZ.from(rhs)) <= 0;
  }

  static from<T>(val: T): MpZ {
    if (val instanceof MpZ) return val;
    if (val instanceof i32) return fromI32(val as i32);
    if (val instanceof u32) return fromU32(val as u32);
    if (val instanceof i64) return fromI64(val as i64);
    if (val instanceof u64) return fromU64(val as u64);
    if (typeof val === 'string') return fromString(val);

    throw new TypeError('Unsupported generic type ' + nameof<T>(val));
  }

  static readonly ZERO: MpZ = new MpZ([0]);
  static readonly ONE: MpZ = new MpZ([1]);
  static readonly TWO: MpZ = new MpZ([2]);

  // @ts-ignore
  @inline @operator('*')
  static mul(lhs: MpZ, rhs: MpZ): MpZ {
    return lhs.mul(rhs);
  }

  // @ts-ignore
  @inline @operator('/')
  static div(lhs: MpZ, rhs: MpZ): MpZ {
    return lhs.div(rhs);
  }

  // @ts-ignore
  @inline @operator('+')
  static add(lhs: MpZ, rhs: MpZ): MpZ {
    return lhs.add(rhs);
  }

  // @ts-ignore
  @inline @operator('-')
  static sub(lhs: MpZ, rhs: MpZ): MpZ {
    return lhs.sub(rhs);
  }

  // @ts-ignore
  @inline @operator('==')
  static eq(lhs: MpZ, rhs: MpZ): boolean {
    return lhs.eq(rhs);
  }

  // @ts-ignore
  @inline @operator('>')
  static gt(lhs: MpZ, rhs: MpZ): boolean {
    return lhs.gt(rhs);
  }

  // @ts-ignore
  @inline @operator('>=')
  static gte(lhs: MpZ, rhs: MpZ): boolean {
    return lhs.gte(rhs);
  }

  // @ts-ignore
  @inline @operator('<')
  static lt(lhs: MpZ, rhs: MpZ): boolean {
    return lhs.lt(rhs);
  }

  // @ts-ignore
  @inline @operator('<=')
  static lte(lhs: MpZ, rhs: MpZ): boolean {
    return lhs.lte(rhs);
  }

  // @ts-ignore
  @inline @operator('!=')
  static neq(lhs: MpZ, rhs: MpZ): boolean {
    return !lhs.eq(rhs);
  }

  // @ts-ignore
  @inline @operator('%')
  static mod(lhs: MpZ, rhs: MpZ): MpZ {
    return lhs.rem(rhs);
  }

  // @ts-ignore
  @inline @operator('**')
  static pow(lhs: MpZ, rhs: MpZ): MpZ {
    return lhs.pow(rhs);
  }

  // @ts-ignore
  @operator('<<')
  static shl_op(lhs: MpZ, rhs: MpZ): MpZ {
    if (rhs.size > 2) {
      throw new RangeError('Maximum MpZ size exceeded');
    }
    if (lhs.eqz()) return MpZ.ZERO;
    if (rhs.eqz()) return lhs;
    if (rhs.isNeg) return MpZ.shr_op(lhs, rhs.abs());
    return lhs.isNeg ? lhs._ushl(rhs.toI64()).neg() : lhs._ushl(rhs.toI64());
  }

  // @ts-ignore
  @operator('>>')
  static shr_op(lhs: MpZ, rhs: MpZ): MpZ {
    if (rhs.size > 2) return MpZ.ZERO;
    if (lhs.eqz()) return MpZ.ZERO;
    if (rhs.eqz()) return lhs;
    if (rhs.isNeg) return MpZ.shl_op(lhs, rhs.abs());
    return lhs.isNeg
      ? lhs.add(1)._ushr(rhs.toI64()).add(1).neg()
      : lhs._ushr(rhs.toI64());
  }

  static readonly A: MpZ = MpZ.from(48 / 17);
  static readonly B: MpZ = MpZ.from(32 / 17);
}
