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
function low32(value: u64): u32 {
  return u32(value & LOW_MASK);
}

// @ts-ignore
@inline
function high32(value: u64): u32 {
  return u32((value >> LIMB_BITS) & LOW_MASK);
}

function fromI32(value: i32): MpZ {
  const neg = value < 0;
  if (value < 0) {
    value = -value;
  }
  return fromU32(<u32>value, neg);
}


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
  const hi = high32(value);
  const lo = low32(value);
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
  if (str.length === 1) return 10;

  const first = str.charAt(0);
  if (first === '0') {
    const second = str.charCodeAt(1);
    switch (second) {
      case 98: // b
        return 2;
      case 111: // o
        return 8;
      case 120: // x
        return 16;
    }
  }
  return 10;
}

function fromString(value: string): MpZ {
  const neg = value.substr(0, 1) === '-';
  value = neg ? value.substr(1) : value;
  const base = getBase(value);
  value = value.substr(base === 10 ? 0 : 2);
  const r = fromStringU(value, base);
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
  protected readonly _size: i32;

  // Contains the limbs of the MpZ
  protected readonly _data: StaticArray<u32>;

  constructor(_data: StaticArray<u32>, _neg: boolean = false) {
    let size = _data.length;

    // Reduce size by leading zeros
    while (size > 1 && unchecked(_data[size - 1] === 0)) {
      size--;
    }

    if (size === 0) {
      this._data = [0];
      this._size = 0;
    } else {
      this._data = _data; // StaticArray.fromArray(_data.slice(0, size));
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
    if (!this.isNeg) return this;
    return new MpZ(this._data);
  }

  // *** Addition ***

  add<T>(_rhs: T): MpZ {
    const rhs = MpZ.from(_rhs);
    if (this.isNeg && rhs.isNeg) return this._uadd(rhs).neg();
    if (this.isNeg) return rhs._usub(this);
    if (rhs.isNeg) return this._usub(rhs);
    if (rhs.size === 1) return this._uaddU32(unchecked(rhs._data[0]));
    if (this.size === 1) return rhs._uaddU32(unchecked(this._data[0]));
    return this._uadd(rhs);
  }

  // unsigned add
  protected _uadd(rhs: MpZ): MpZ {
    return this.size < rhs.size ? rhs.__uadd(this) : this.__uadd(rhs);
  }

  // unsigned add
  // Size(lhs) > Size(rhs)
  protected __uadd(rhs: MpZ): MpZ {
    const q = this.size;
    const result = new StaticArray<u32>(q + 1);

    let carry: u32 = 0;
    for (let i: i32 = 0; i < q; ++i) {
      unchecked(
        (result[i] = carry + this._data[i] + (rhs.size > i ? rhs._data[i] : 0)),
      );
      carry = unchecked(result[i] < this._data[i]) ? 1 : 0;
    }
    unchecked((result[q] = carry));

    return new MpZ(result);
  }

  protected _uaddU32(rhs: u32): MpZ {
    assert(ASC_NO_ASSERT || !this.isNeg, '_uaddU32: lhs must be positive');

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

    if (s_lhs && s_rhs) return this._usub(rhs).neg();
    if (s_lhs) return this._uadd(rhs).neg();
    if (s_rhs) return this._uadd(rhs);
    return this._usub(rhs);
  }

  // unsigned sub (lhs > 0, rhs > 0)
  protected _usub(rhs: MpZ): MpZ {
    assert(ASC_NO_ASSERT || !this.isNeg, '_usub: lhs must be positive');
    assert(ASC_NO_ASSERT || !rhs.isNeg, '_usub: rhs must be positive');

    if (this._ucmp(rhs) < 0) return rhs._usub(this).neg();
    if (rhs.size === 1) return this.__usub32(unchecked(rhs._data[0]));
    return this.__usub(rhs);
  }

  // unsigned sub (lhs >= rhs)
  protected __usub(rhs: MpZ): MpZ {
    assert(ASC_NO_ASSERT || this > rhs, '__usub: lhs must be greater than rhs');

    const q = this.size;
    const result = new StaticArray<u32>(q);

    let borrow: u32 = 0;
    for (let i: i32 = 0; i < q; ++i) {
      const lhs_limb = unchecked(this._data[i]);
      const rhs_limb = rhs.size > i ? unchecked(rhs._data[i]) : 0;

      unchecked((result[i] = lhs_limb - borrow));
      borrow = borrow > lhs_limb || unchecked(rhs_limb > result[i]) ? 1 : 0;
      unchecked((result[i] -= rhs_limb));
    }
    return new MpZ(result);
  }

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

    let p: MpZ;

    if (s_rhs === 1) {
      p = this.abs()._umulU32(unchecked(rhs._data[0]));
    } else if (s_lhs === 1) {
      p = rhs.abs()._umulU32(unchecked(this._data[0]));
    } else {
      p = this.abs()._umul(rhs);
    }

    return this.isNeg !== rhs.isNeg ? p.neg() : p;
  }

  // unsigned mul
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
        unchecked((result[k] = low32(carry)));
        carry = high32(carry);
      }
      unchecked((result[i + p] = low32(carry)));
    }

    return new MpZ(result);
  }

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
        unchecked((result[k] = low32(carry)));
        carry = high32(carry);
      }
      unchecked((result[i + q] = low32(carry)));
    }

    return new MpZ(result);
  }

  protected _umulU32(rhs: u32): MpZ {
    const q = this.size;
    const result = new StaticArray<u32>(q + 1);

    let carry: u64 = 0;
    for (let i: i32 = 0; i < q; ++i) {
      carry += u64(unchecked(this._data[i])) * u64(rhs);
      unchecked((result[i] = low32(carry)));
      carry = high32(carry);
    }
    unchecked((result[q] = low32(carry)));

    return new MpZ(result);
  }

  protected _umul2powU32(rhs: u32): MpZ {
    const q = this.size;
    const result = new StaticArray<u32>(q + 1);

    let carry: u64 = 0;
    for (let i: i32 = 0; i < q; ++i) {
      carry += u64(unchecked(this._data[i])) << rhs;
      unchecked((result[i] = low32(carry)));
      carry = high32(carry);
    }
    unchecked((result[q] = low32(carry)));

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

  protected _limbShiftLeft(limbs: u32): MpZ {
    if (limbs === 0) return this;
    const data = this._data.slice();
    const low = new StaticArray<u32>(limbs);
    return new MpZ(StaticArray.fromArray<u32>(low.concat(data)));
  }

  protected _limbShiftRight(n: u32): MpZ {
    if (n === 0) return this;
    if (n >= <u32>this.size) return MpZ.ZERO;
    const data = this._data.slice(n);
    return new MpZ(StaticArray.fromArray<u32>(data));
  }

  protected _bitShiftLeft(n: u32): MpZ {
    assert(ASC_NO_ASSERT || n < LIMB_BITS, '_bitShiftLeft: n must be less than LIMB_BITS');

    if (n === 0) return this;
    return this._umul2powU32(n);
  }

  protected _bitShiftRight(n: u32): MpZ {
    assert(ASC_NO_ASSERT || n < LIMB_BITS, '_bitShiftRight: n must be less than LIMB_BITS');

    if (n === 0) return this;
    return this._divPow2(n);
  }

  protected _divPow2(n: u32): MpZ {
    const q = this.size;
    const result = new StaticArray<u32>(q);
    const n2 = 2 ** n;

    let rem: u64 = 0;
    for (let i: i32 = this.size - 1; i >= 0; --i) {
      rem = u64(unchecked(this._data[i])) + (rem << 32);
      unchecked((result[i] = low32(rem >> n)));
      rem %= n2;
    }

    return new MpZ(result);
  }

  protected _div2(): MpZ {
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

  protected _shl(n: u32): MpZ {
    if (n === 0) return this;
    return this._limbShiftLeft(n / LIMB_BITS)._bitShiftLeft(n % LIMB_BITS);
  }

  protected _shr(n: u32): MpZ {
    if (n === 0) return this;
    return this._limbShiftRight(n / LIMB_BITS)._bitShiftRight(n % LIMB_BITS);
  }


  @operator('<<')
  shl(n: u32): MpZ {
    if (n === 0) return this;
    if (this.eqz()) return MpZ.ZERO;
    if (n < 0) return this._shr(-n);
    return this._shl(n);
  }


  @operator('>>')
  shr(n: u32): MpZ {
    if (n === 0) return this;
    if (this.eqz()) return MpZ.ZERO;
    if (n < 0) return this._shl(-n);
    return this._shr(n);
  }

  // *** Division ***

  div<T>(_rhs: T): MpZ {
    if (this.eqz()) return MpZ.ZERO;

    const rhs = MpZ.from(_rhs);

    if (rhs.eqz()) throw new Error('Divide by zero');
    if (rhs.eq(MpZ.ONE)) return this;
    if (this.eq(rhs)) return MpZ.ONE;

    const s_lhs = this.isNeg;
    const s_rhs = rhs.isNeg;

    const dividend = this.abs();
    const divisor = rhs.abs();

    if (dividend.lt(divisor)) return MpZ.ZERO;

    if (divisor.size === 1) {
      const r = dividend._udivU32(unchecked(divisor._data[0]));
      return s_lhs !== s_rhs ? r.neg() : r;
    }

    const p = dividend._udiv(divisor);
    return s_lhs !== s_rhs ? p.neg() : p;
  }

  // unsigned divide, lhs > rhs
  // Donald Knuth’s Algorithm D
  protected _udiv(rhs: MpZ): MpZ {
    assert(ASC_NO_ASSERT || this > rhs, '_udiv: lhs must be greater than rhs');

    const m = this.size;
    const n = rhs.size;
    const result = new StaticArray<u32>(m - n + 1);

    // Normalize by shifting rhs left just enough so that
    // its high-order bit is on, and shift lhs left the
    // same amount.
    const s = rhs._clz();
    const un = this._shl(s).toArray();
    const vn = rhs._shl(s).toArray();

    // We may have to append a high-order
    // digit on the dividend;
    if (un.length === m) {
      un.push(0);
    }

    assert(ASC_NO_ASSERT || un.length === m + 1, '_udiv2: un.length !== m + 1');
    assert(ASC_NO_ASSERT || vn.length === n, '_udiv2: vn.length !== n');

    // Main loop.
    for (let j = m - n; j >= 0; j--) {
      const h: u64 = (unchecked(u64(un[j+n]) << 32) + un[j+n-1]);
      const v = u64(unchecked(vn[n-1]));
      let qhat: u64 = h / v;
      let rhat: u64 = h % v;

      while(true){
        if ((qhat >= BASE) || (low32(qhat)*unchecked(u64(vn[n-2])) > (rhat << 32) + unchecked(u64(un[j+n-2])))) {
          qhat -= 1;
          rhat += unchecked(vn[n-1]);
          if (rhat < BASE) continue;
        }
        break;
      }

      // Multiply and subtract.
      let k: i64 = 0;
      let t: i64 = 0;
      for (let i = 0; i < n; i++) {
          const p: u64 = qhat * u64(vn[i]);
          t = unchecked(un[i+j]) - k - low32(p);
          unchecked(un[i+j] = low32(t));
          k = (p >> 32) - (t >> 32);
      }
      unchecked(un[j+n] = low32(t = un[j+n] - k));

      unchecked(result[j] = low32(qhat));              // Store quotient digit.
      if (t < 0) {              // If we subtracted too much, add back.
        result[j] -= result[j];       // much, add back.
        k = 0;
        for (let i = 0; i < n; i++) {
          unchecked(un[i+j] = low32(t = un[i+j] + vn[i] + k));
          k = t >> 32;
        }
        unchecked(un[j+n] = low32(un[j+n] + k));
      }
    }
    return new MpZ(result);
  }

  protected _udivU32(rhs: u32): MpZ {
    assert(ASC_NO_ASSERT || !this.isNeg, '_udivU32: lhs must be positive');

    const q = this.size;
    const result = new StaticArray<u32>(q);

    let rem: u64 = 0;
    for (let i: i32 = this.size - 1; i >= 0; --i) {
      rem = u64(unchecked(this._data[i])) + u64(rem << 32);
      unchecked((result[i] = low32(rem / rhs)));
      rem %= rhs;
    }

    return new MpZ(result);
  }

  protected _udivRemU32(rhs: u32): DivRem<u32> {
    assert(ASC_NO_ASSERT || !this.isNeg, '_udivRemU32: lhs must be positive');

    const q = this.size;
    const result = new StaticArray<u32>(q);

    let rem: u64 = 0;
    for (let i: i32 = this.size - 1; i >= 0; --i) {
      rem = u64(unchecked(this._data[i])) + (rem << 32);
      unchecked((result[i] = low32(rem / rhs)));
      rem %= rhs;
    }

    const d = new MpZ(result);
    const r = low32(rem);
    return { div: d, rem: r };
  }

  // *** Modulus ***

  mod<T>(_rhs: T): MpZ {
    const rhs = MpZ.from(_rhs);
    if (rhs.eqz()) throw new Error('Divide by zero');

    const lhs = this.abs();

    if (rhs.size === 1) {
      const m = lhs._umodU32(unchecked(rhs._data[0]));
      return this.isNeg ? MpZ.from(m).neg() : MpZ.from(m);
    }

    const m = lhs._umod(rhs.abs());
    return this.isNeg ? m.neg() : m;
  }

  protected _umodU32(rhs: u32): u32 {
    assert(ASC_NO_ASSERT || !this.isNeg, '_umodU32: lhs must be positive');

    let rem: u64 = 0;
    for (let i: i32 = this.size - 1; i >= 0; --i) {
      rem = u64(unchecked(this._data[i])) + (rem << 32);
      rem %= rhs;
    }
    return low32(rem);
  }

  protected _umod(rhs: MpZ): MpZ {
    assert(ASC_NO_ASSERT || !this.isNeg, '_umod: lhs must be positive');
    assert(ASC_NO_ASSERT || !rhs.isNeg, '_umod: rhs must be positive');

    if (this.lt(rhs)) return this;

    const q = this._udiv(rhs);
    const m = this._usub(q._umul(rhs));
    return m.gte(rhs) ? m._usub(rhs) : m;
  }

  rem<T>(_rhs: T): MpZ {
    const rhs = MpZ.from(_rhs);
    if (rhs.eqz()) throw new Error('Divide by zero');
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
    const lhs = this.abs();
    const p =
      rhs.size === 1 ? lhs._upowU32(unchecked(rhs._data[0])) : lhs._upow(rhs);
    return neg ? p.neg() : p;
  }

  // Exponentiation by squaring (modified)
  protected _upow(rhs: MpZ): MpZ {
    assert(ASC_NO_ASSERT || !this.eqz(), '_upow: lhs must be non-zero');
    assert(ASC_NO_ASSERT || !rhs.eqz(), '_upow: lhs must be non-zero');

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

  powMod<T, M>(_rhs: T, _m: M): MpZ {
    const rhs = MpZ.from(_rhs);
    if (rhs.isNeg) return MpZ.ZERO;

    if (rhs.eqz()) return MpZ.ONE;
    if (rhs.eq(MpZ.ONE)) return this;
    if (this.eqz()) return MpZ.ZERO;
    if (this.eq(MpZ.ONE)) return MpZ.ONE;

    const m = MpZ.from(_m);
    const neg = this.isNeg && rhs.isOdd();
    const p = this.abs()._powMod(rhs, m);
    return neg ? p.neg() : p;
  }

  protected _powMod(rhs: MpZ, m: MpZ): MpZ {
    let result = MpZ.ONE;
    let base: MpZ = this._umod(m);

    const len = rhs.size;
    for (let i: i32 = 0; i < len; ++i) {
      let limb = unchecked(rhs._data[i]);

      for (let j: u32 = 0; j < LIMB_BITS; ++j) {
        if (limb & 1) {
          result = result._umul(base)._umod(m);
        }

        limb >>= 1;
        if (limb === 0 && i === len - 1) break;
        base = base._umul(base)._umod(m);
      }
    }

    return result;
  }

  // Exponentiation by squaring
  // protected _upowBySquaring(rhs: MpZ): MpZ {
  //   let result = MpZ.ONE;
  //   let lhs: MpZ = this;

  //   while (true) {
  //     if (rhs.isOdd()) {
  //       result = result._umul(lhs);
  //     }

  //     rhs = rhs._div2();
  //     if (rhs.eqz()) break;
  //     lhs = lhs._umul(lhs);
  //   }

  //   return result;
  // }

  // Exponentiation by squaring
  protected _upowU32(rhs: u32): MpZ {
    assert(ASC_NO_ASSERT || !this.isNeg, '_upowU32: lhs must be positive');

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
    return !this.isOdd();
  }


  @operator.prefix('-')
  neg(): MpZ {
    if (this.eqz()) return this;
    return new MpZ(this._data, !this.isNeg);
  }

  // *** ToString ***

  protected _uhex(): string {
    let r = '';

    for (let i: i32 = this.size - 1; i >= 0; --i) {
      r += u32ToHex(unchecked(this._data[i]), i !== this.size - 1);
    }

    return r;
  }

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
  toArray(): u32[] {
    return this._data.slice<u32[]>(0, this.size);
  }

  toU32(): u32 {
    return unchecked(this._data[0]);
  }

  toI32(): u32 {
    return unchecked(<i32>this._data[0]);
  }

  // *** Comparison ***

  eqz(): boolean {
    return this.size === 1 && unchecked(this._data[0]) === 0;
  }

  cmp<T>(_rhs: T): i32 {
    const rhs = MpZ.from(_rhs);

    const lhs_s = this.isNeg;
    const rhs_s = rhs.isNeg;

    if (lhs_s !== rhs_s) return lhs_s ? -1 : 1;

    const c = this._ucmp(rhs);

    return lhs_s ? -c : c;
  }

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


  @inline @operator('*')
  static mul(lhs: MpZ, rhs: MpZ): MpZ {
    return lhs.mul(rhs);
  }


  @inline @operator('/')
  static div(lhs: MpZ, rhs: MpZ): MpZ {
    return lhs.div(rhs);
  }


  @inline @operator('+')
  static add(lhs: MpZ, rhs: MpZ): MpZ {
    return lhs.add(rhs);
  }


  @inline @operator('-')
  static sub(lhs: MpZ, rhs: MpZ): MpZ {
    return lhs.sub(rhs);
  }


  @inline @operator('==')
  static eq(lhs: MpZ, rhs: MpZ): boolean {
    return lhs.eq(rhs);
  }


  @inline @operator('>')
  static gt(lhs: MpZ, rhs: MpZ): boolean {
    return lhs.gt(rhs);
  }


  @inline @operator('>=')
  static gte(lhs: MpZ, rhs: MpZ): boolean {
    return lhs.gte(rhs);
  }


  @inline @operator('<')
  static lt(lhs: MpZ, rhs: MpZ): boolean {
    return lhs.lt(rhs);
  }


  @inline @operator('<=')
  static lte(lhs: MpZ, rhs: MpZ): boolean {
    return lhs.lte(rhs);
  }


  @inline @operator('!=')
  static neq(lhs: MpZ, rhs: MpZ): boolean {
    return !lhs.eq(rhs);
  }


  @inline @operator('%')
  static mod(lhs: MpZ, rhs: MpZ): MpZ {
    return lhs.mod(rhs);
  }


  @inline @operator('**')
  static pow(lhs: MpZ, rhs: MpZ): MpZ {
    return lhs.pow(rhs);
  }

  static readonly A: MpZ = MpZ.from(48 / 17);
  static readonly B: MpZ = MpZ.from(32 / 17);
}
