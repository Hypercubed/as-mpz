<!-- ⚠️ This README has been generated from the file(s) "blueprint.md" ⚠️-->

[](#-pkgname-)

# @hypercubed/as-mpz

Immutable arbitrary precision integer library for AssemblyScript.

[](#features)

## Features

- Arbitrary precision integers (theoretically limited by memory)
- Fast (extensivly benchmarked)
- Accurate\* (tested against JavaScript BigInt)
- For use in AssemblyScript projects
- No dependencies

[](#-disclaimer)

## \* Disclaimer

> While `as-mpz`` has undergone rigorous testing and benchmarking to ensure its reliability and performance, the developers would like to emphasize that the library is provided "as is," and they assume no responsibility for any issues that may arise from its use.

[](#installations)

## Installations

```sh
npm install @hypercubed/as-mpz
```

[](#quick-start)

## Quick Start

```ts
import { MpZ } from '@hypercubed/as-mpz';

const a = MpZ.from(18448972);
const b = MpZ.from('7881297289452930');
const c = MpZ.from('0x583F99D51C76AB3DEAB75');

const c = a.add(b).mul(c);
```

Or using operators:

```ts
import { MpZ } from '@hypercubed/as-mpz';

const a = MpZ.from(18448972);
const b = MpZ.from('7881297289452930');
const c = MpZ.from('0x583F99D51C76AB3DEAB75');

const c = (a + b) * c;
```

> Note: Arithmatic methods and operators can be used interchangably, with operators acting as shorthand for the methods.
> However, unlike instance methods, the operators do not coerce inputs to an MpZ.

[](#as-mpz-api)

## `as-mpz` API

Value is stored as a sign and magnitude.

> Note: Arithmatic methods and operators can be used interchangably, with operators acting as shorthand for the methods.
> However, unlike instance methods, the operators do not coerce inputs to an MpZ.

### Constructor

#### `MpZ.from(value: i32 | u32 | i64 | u64 | string): MpZ`

Creates a new MpZ from a number or string. The `MpZ.from` method accepts a number or string. The string can be in decimal or hexadecimal format (prefixed with `0x`). The string can also be prefixed with `-` to indicate a negative number.

> Note: The MpZ class should not be instantiated directly (using `new`). Instead use the static `MpZ.from` method to create a new MpZ.

### Instance Methods

#### `#isNeg(): boolean`

Returns `true` if this MpZ is negative, otherwise `false`.

#### `#abs(): MpZ`

Returns the absolute value of this MpZ.

#### `#sign(): MpZ`

Returns the sign of this MpZ, indicating whether x is positive (`1`), negative (`-1`), or zero (`0`).

#### `#isOdd(): MpZ`

Returns `true` if this MpZ is odd, otherwise `false`.

#### `#isEven(): boolean`

Returns `true` if this MpZ is even, otherwise `false`.

#### `#negate(): MpZ`

Returns the negation of this MpZ (`-this`).

#### `#add(rhs: i32 | u32 | i64 | u64 | MpZ): MpZ`

Returns the sum of this MpZ and `rhs`.

#### `#inc(): MpZ`

Returns the increment of this MpZ (`this + 1`).

#### `#sub(rhs: i32 | u32 | i64 | u64 | MpZ): MpZ`

Returns the difference of this MpZ and the `rhs`.

#### `#dec(): MpZ`

Returns the decrement of this MpZ (`this - 1`).

#### `#mul(rhs: i32 | u32 | i64 | u64 | MpZ): MpZ`

Returns the product of this MpZ and the `rhs` (`this * rhs`).

#### `#mul_pow2(rhs: i32 | u32 | i64 | u64 | MpZ): MpZ`

Returns the product of this MpZ multiplied and `2**rhs` (`this * 2 ** rhs`).

#### `#div(rhs: MpZ): MpZ`

Returns the quotient of this MpZ divided by the `rhs` (`trunc(this / rhs)`) truncated towards zero.

#### `#div_pow2(rhs: i32 | u32 | i64 | u64 | MpZ): MpZ`

Returns the quotant of this MpZand `2**rhs` (`this / 2 ** rhs`) truncated towards zero.

#### `#mod(rhs: MpZ): MpZ`

Returns the modulus of this MpZ divided by the `rhs`.

> Note: The `#mod` method is not the same as the `%` operator. The `%` operator returns the `#rem` of the division of the lhs and rhs, while the `#mod` method returns the modulo of the lhs and rhs.

#### `#rem(rhs: MpZ): MpZ`

Returns the remainder of this MpZ divided by the `rhs` (`this % rhs`).

> Note: The `#rem` method is the same as the `%` operator. The `%` operator returns the `#rem` of the division of the lhs and rhs, while the `#mod` method returns the modulo of the lhs and rhs.

#### `#pow(rhs: i32 | u32 | i64 | u64 | MpZ): MpZ`

Returns the value of this MpZ raised to the power of `rhs` (`this ** rhs`).

#### `#fact(): MpZ`

Returns the factorial of this MpZ (`this!`).
Throws RangeError if this is negative or too large (greater than MAX_INTEGER)

#### `#shiftLeft(rhs: i32 | u32 | i64 | u64 | MpZ): MpZ`

Returns the value of this MpZ left shifted by `rhs` (`this << rhs`).
Negative `rhs` values shift right.

> The `#shiftLeft` method return the result of the bitwise shift as if the MpZ was a 2's complement signed integer; matching JavaScript's BigInt `<<` operator.

#### `#shiftRight(rhs: i32 | u32 | i64 | u64 | MpZ): MpZ`

Returns the value of this MpZ right shifted by `rhs` (`this >> rhs`).
Negative `rhs` values shift left.

> The `#shiftLeft` method return the result of the bitwise shift as if the MpZ was a 2's complement signed integer; matching JavaScript's BigInt `>>` operator.

#### `#not(): MpZ`

Returns the bitwise NOT of this MpZ (`~this`).

> The `#not` method returns the result as if the MpZ was a 2's complement signed integer (yeilding `-(x + 1)`); matching JavaScript's BigInt `~` operator.

#### `#and(rhs: MpZ): MpZ`

Returns the bitwise AND of this MpZ and `rhs`.

> Note: The `#and` method returns the result of the bitwise `AND` as if the MpZ was a 2's complement signed integer; matching JavaScript's `&` BigInt operator.

#### `#or(rhs: MpZ): MpZ`

Returns the bitwise OR of this MpZ and `rhs`.

> Note: The `#or` method returns the result of the bitwise `OR` as if the MpZ was a 2's complement signed integer; matching JavaScript's BigInt `|` operator.

#### `#xor(rhs: MpZ): MpZ`

Returns the bitwise XOR of this MpZ and `rhs`.

Note: The `#xor` method returns the result of the bitwise `XOR` as if the MpZ was a 2's complement signed integer; matching JavaScript's BigInt `^` operator.

#### `#toString(radix: i32 = 10): string`

Returns the value of this MpZ as a string. The radix can be from 2 and 36 (inclusive). The default radix is 10.

Note: The resulting string is not prefixed with the radix (e.g. `0x` or `0b`) and therefore not compatible as input to `MpZ.from` (radix of 10 excluded).

#### `#toHex(): string`

Returns the value of this MpZ as a hexadecimal string.

> Note: The resulting string is prefixed with `0x` and is therefore compatible as input to `MpZ.from`.

#### `#toDecimal(): string`

Returns the value of this MpZ as a decimal string.

#### `#valueOf(): number`

Returns the value of this MpZ as a `number`.

#### `#toU32Array(): u32[]`

Returns the value of this MpZ as an unsigned 32-bit integer array. Ther sign of the MpZ is ignored.

#### `#toU32(): u32`

Returns the value of this MpZ as an unsigned 32-bit integer. If this MpZ is too big to fit in an int32, only the low-order 32 bits are returned.
If this MpZ is negative, the returned value is the 2's complement representation of the MpZ.

#### `#toI32(): i32`

Returns the value of this MpZ as a signed 32-bit integer. If this MpZ is too big to fit in an int32, only the low-order 32 bits are returned.

#### `#toU64(): u64`

Returns the value of this MpZ as an unsigned 64-bit integer. If this MpZ is too big to fit in an int64, only the low-order 64 bits are returned.

#### `#toI64(): i64`

Returns the value as a signed 64-bit integer. If this MpZ is too big to fit in an int64, only the low-order 64 bits are returned.

#### `#eqz(): boolean`

Returns `true` if this MpZ is equal to zero.

#### `#compareTo(rhs: MpZ | i32 | u32 | i64 | u64 | string): i32`

Returns `-1` if this MpZ is less than the rhs, `0` if this MpZ is equal to the rhs, or `1` if this MpZ is greater than the rhs.

#### `#eq(rhs: MpZ | i32 | u32 | i64 | u64 | string): boolean`

Returns `true` if this MpZ is equal to the rhs.

#### `#ne(rhs: MpZ | i32 | u32 | i64 | u64 | string): boolean`

Returns `true` if this MpZ is not equal to the rhs.

#### `#gt(rhs: MpZ | i32 | u32 | i64 | u64 | string): boolean`

Returns `true` if this MpZ is greater than the rhs.

#### `#ge(rhs: MpZ | i32 | u32 | i64 | u64 | string): boolean`

Returns `true` if this MpZ is greater than or equal to the rhs.

#### `#lt(rhs: MpZ | i32 | u32 | i64 | u64 | string): boolean`

Returns `true` if this MpZ is less than the rhs.

#### `#le(rhs: MpZ | i32 | u32 | i64 | u64 | string): boolean`

Returns `true` if this MpZ is less than or equal to the rhs.

### Operators

#### Unary `-` operator

Returns the negation of this MpZ (`-this`).

#### Binary `+`, `-`, `*`, `/` operators

Same as the `#add`, `#sub`, `#mul`, `#div` methods.

### Comparison Operators

#### `==`, `>`, `>=`, `<`, `<=`, `!=`

Same as the `#eq`, `#gt`, `#ge`, `#lt`, `#le`, `#ne` methods.

#### `%` operator

Returns the remainder of the lhs and rhs (`lhs % rhs`).

> Note: The `%` operator is not the same as the `#mod` method. The `%` operator returns the `#rem` of the division of the lhs and rhs; matching JavaScript's BigInt `%` operator.

#### `**` operator

Returns the power of the lhs to the rhs (`lhs ** rhs`).

#### `<<`, `>>` operators

Returns the result of the left/right shift of the lhs by the rhs. Negitive rhs values will result in a opposite shift.

> Shift operators behave as if they were represented in two's-complement notation; like JavaScripts's `<<` and `>>` operators.

#### `~` operator

Returns the bitwise NOT of this MpZ (`~this`).

### `&`, `|`, `^ operators

Returns the bitwise `AND`, `OR`, `XOR` operation on the two operands.

> This operator returns the result of the bitwise `AND`, `OR`, `XOR` as if the values were 2's complement signed integers; matching JavaScript's BigInt `&`, `|`, `^` operators.

### `!` operator

Returns the logical NOT of this MpZ (`!this`). This is equivalent to `#eqz()`.

### `MpZ.asIntN(bits: u32, a: MpZ): MpZ`

Returns a BigInt value truncated to the given number of least significant bits and returns that value as a signed integer.
If the leading bit of the remaining number is 1, the result is negative.

### `MpZ.asUintN(bits: u32, a: MpZ): MpZ`

Returns a BigInt value truncated to the given number of least significant bits and returns that value as an unsigned integer.
Results are always non-negative and two's complement in binary.

### `MpZ.random(bits: u64): MpZ`

Returns a random MpZ value with the specified maximum number of bits.

[](#license)

## License

Licensed under [MIT](https://opensource.org/licenses/MIT).
MIT License

Copyright (c) 2024 Jayson Harshbarger

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
