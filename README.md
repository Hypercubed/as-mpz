# as-mpz

Immutable arbitrary precision integer library for AssemblyScript.

## Features

- Arbitrary precision integers (theoretically limited by memory)
- Fast (extensivly benchmarked)
- Accurate\* (tested against JavaScript BigInt)
- For use in AssemblyScript projects
- No dependencies

## \* Disclaimer

> While `as-mpz`` has undergone rigorous testing and benchmarking to ensure its reliability and performance, the developers would like to emphasize that the library is provided "as is," and they assume no responsibility for any issues that may arise from its use.

## Installations

```sh
npm install @hypercubed/as-mpz
```

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
> However, the bitwise operators (`&`, `|`, `^`, `>>`, `<<`) are not the same as the bitwise methods (`#and`, `#or`, `#xor`, `#bitShift`).
> The methods return the result of the bitwise operation on the sign-magnitute integer; treating the sign seperate from the magnitude.
> Conversely, the operators return the result of the bitwise operation as if the MpZ was a 2's complement signed integer matching JavaScripts BigInt operators.
> The difference is subtle, but important for negitive numbers.

## API

### `MpZ.from(value: i32 | u32 | i64 | u64 | string): MpZ`

Creates a new MpZ from a number or string.  The `MpZ.from` method accepts a number or string. The string can be in decimal or hexadecimal format (prefixed with `0x`). The string can also be prefixed with `-` to indicate a negative number.

> Note: The MpZ class should not be instantiated directly (using `new`). Instead use the static `MpZ.from` method to create a new MpZ.


### `#isNeg(): boolean`

Returns `true` if this MpZ is negative, otherwise `false`.


### `#abs(): MpZ`

Returns the absolute value of this MpZ.


### `#add(rhs: i32 | u32 | i64 | u64 | MpZ): MpZ`

Returns the sum of this MpZ and `rhs`.


### `#sub(rhs: i32 | u32 | i64 | u64 | MpZ): MpZ`

Returns the difference of this MpZ and the `rhs`.


### `#mul(rhs: i32 | u32 | i64 | u64 | MpZ): MpZ`

Returns the product of this MpZ and the `rhs` (`this * rhs`).


### `#mul_pow2(rhs: i32 | u32 | i64 | u64 | MpZ): MpZ`

Returns the product of this MpZ multiplied and `2**rhs` (`this * 2 ** rhs`).


### `#div_pow2(rhs: i32 | u32 | i64 | u64 | MpZ): MpZ`

Returns the quotant of this MpZand `2**rhs` (`this / 2 ** rhs`) truncated towards zero.


### `#bitShift(rhs: i32 | u32 | i64 | u64 | MpZ): MpZ`

Returns the value of this MpZ shifted by `rhs`.  Negative values shift right, positive values shift left.

> Note: The `#bitShift` method is not the same as the `<<` and `>>` operators. The `#bitShift` method returns the bitwise shift of the unsigned magnitude of the MpZ and rhs. The signedness of the result is equal to signedness of the MpZ. The `<<` and `>>` operators return the result of the bitwise shift as if the MpZ was a 2's complement signed integer; matching JavaScript's built-in BigInt operator.


### `#div(rhs: MpZ): MpZ`

Returns the quotient of this MpZ divided by the `rhs` (`this / rhs`). truncated towards zero


### `#mod(rhs: MpZ): MpZ`

Returns the modulus of this MpZ divided by the `rhs`.

> Note: The `#mod` method is not the same as the `%` operator.  The `%` operator returns the `#rem` of the division of the lhs and rhs, while the `#mod` method returns the modulo of the lhs and rhs.


### `#rem(rhs: MpZ): MpZ`

Returns the remainder of this MpZ divided by the `rhs` (`this % rhs`).

> Note: The `#rem` method is the same as the `%` operator.  The `%` operator returns the `#rem` of the division of the lhs and rhs, while the `#mod` method returns the modulo of the lhs and rhs.


### `#pow(rhs: i32 | u32 | i64 | u64 | MpZ): MpZ`

Returns the value of this MpZ raised to the power of `rhs` (`this ** rhs`).


### `#not(): MpZ`

Returns the bitwise NOT of this MpZ (`~this`).


### `#and(rhs: MpZ): MpZ`

Returns the bitwise AND of this MpZ and `rhs`.

> Note: The `#and` method is not the same as the `&` operator. The `#and` method returns the bitwise `and` of the unsigned magnitude of the MpZ and rhs. The signedness of the result is an `and` of the signedness of the MpZ and rhs. The `&` operator returns the result of the bitwise `and` as if the MpZ was a 2's complement signed integer; matching JavaScript's built-in BigInt operator.


### `#xor(rhs: MpZ): MpZ`

Returns the bitwise OR of this MpZ and `rhs`.

> Note: The `#or` method is not the same as the `|` operator. The `#or` method returns the bitwise `OR` of the unsigned magnitude of the MpZ and rhs. The signedness of the result is an `and` of the signedness of the MpZ and rhs. The `&` operator returns the result of the bitwise `OR` as if the MpZ was a 2's complement signed integer; matching JavaScript's built-in BigInt operator.


### `#xor(rhs: MpZ): MpZ`

Returns the bitwise XOR of this MpZ and `rhs`.

> Note: The `#xor` method is not the same as the `^` operator. The `#xor` method returns the bitwise `XOR` of the unsigned magnitude of the MpZ and rhs. The signedness of the result is an `XOR` of the signedness of the MpZ and rhs. The `^` operator returns the result of the bitwise `XOR` as if the MpZ was a 2's complement signed integer; matching JavaScript's built-in BigInt operator.


### `#isOdd(): MpZ`

Returns `true` if this MpZ is odd, otherwise `false`.


### `#isEven(): boolean`

Returns `true` if this MpZ is even, otherwise `false`.


### `#neg(): MpZ`

Returns the negation of this MpZ (`-this`).


### `#toString(radix: i32 = 10): string`

Returns the value of this MpZ as a string. The radix can be from 2 and 36 (inclusive). The default radix is 10.

Note: The resulting string is not prefixed with the radix (e.g. `0x` or `0b`) and therefore not compatible as input to `MpZ.from` (radix of 10 excluded).


### `#toHex(): string`

Returns the value of this MpZ as a hexadecimal string.

> Note: The resulting string is prefixed with `0x` and is therefore compatible as input to `MpZ.from`.


### `#toDecimal(): string`

Returns the value of this MpZ as a decimal string.


### `#toValue(): number`

Returns the value of this MpZ as a `number`.


### `#toU32Array(): u32[]`

Returns the value of this MpZ as an unsigned 32-bit integer array.  Ther sign of the MpZ is ignored.


### `#toU32(): u32`

Returns the value of this MpZ as an unsigned 32-bit integer.  If this MpZ is too big to fit in an int32, only the low-order 32 bits are returned.
If this MpZ is negative, the returned value is the 2's complement representation of the MpZ.


### `#toI32(): i32`

Returns the value of this MpZ as a signed 32-bit integer.  If this MpZ is too big to fit in an int32, only the low-order 32 bits are returned.


### `#toU64(): u64`

Returns the value of this MpZ as an unsigned 64-bit integer.  If this MpZ is too big to fit in an int64, only the low-order 64 bits are returned.


### `#toI64(): i64`

Returns the value as a signed 64-bit integer.  If this MpZ is too big to fit in an int64, only the low-order 64 bits are returned.


### `#eqz(): boolean`

Returns `true` if this MpZ is equal to zero.


### `#cmp(rhs: MpZ | i32 | u32 | i64 | u64 | string): i32`

Returns `-1` if this MpZ is less than the rhs, `0` if this MpZ is equal to the rhs, or `1` if this MpZ is greater than the rhs.


### `#eq(rhs: MpZ | i32 | u32 | i64 | u64 | string): boolean`

Returns `true` if this MpZ is equal to the rhs.


### `#ne(rhs: MpZ | i32 | u32 | i64 | u64 | string): boolean`

Returns `true` if this MpZ is not equal to the rhs.


### `#gt(rhs: MpZ | i32 | u32 | i64 | u64 | string): boolean`

Returns `true` if this MpZ is greater than the rhs.


### `#ge(rhs: MpZ | i32 | u32 | i64 | u64 | string): boolean`

Returns `true` if this MpZ is greater than or equal to the rhs.


### `#lt(rhs: MpZ | i32 | u32 | i64 | u64 | string): boolean`

Returns `true` if this MpZ is less than the rhs.


### `#le(rhs: MpZ | i32 | u32 | i64 | u64 | string): boolean`

Returns `true` if this MpZ is less than or equal to the rhs.


### Arithmatioc Operators

### `+`, `-`, `*`, `/`

Same as the `#add`, `#sub`, `#mul`, `#div` methods.


### Comparison Operators

### `==`, `>`, `>=`, `<`, `<=`, `!=`

Same as the `#eq`, `#gt`, `#ge`, `#lt`, `#le`, `#ne` methods.


### `%` operator

Returns the remainder of the lhs and rhs.

> Note: The `%` operator is not the same as the `#mod` method. The `%` operator returns the `#rem` of the division of the lhs and rhs; matching JavaScript's built-in BigInt operator.


### `**` operator

Returns the power of the lhs to the rhs.


### `<<` operator

Returns the result of the left shift of the lhs by the rhs.  Negitive rhs values will result in a right shift.

> Shift operators behave as if they were represented in two's-complement notation (like JavaScripts's primitive integer types).


### `>>` operator

Returns the result of the right shift of the lhs by the rhs.  Negitive rhs values will result in a left shift.

> Shift operators behave as if they were represented in two's-complement notation (like JavaScripts's primitive integer types).


### `&` operator

Returns the bitwise `AND` operation on the two operands.

> This operator returns the result of the bitwise `AND` as if the values were 2's complement signed integers; matching JavaScript's built-in BigInt operators.


### `|` operator

Returns the bitwise `OR` operation on the two operands.

> This operator returns the result of the bitwise `OR` as if the values were 2's complement signed integers; matching JavaScript's built-in BigInt operators.


### `^` operator

Returns the bitwise `XOR` operation on the two operands.

> This operator returns the result of the bitwise `XOR` as if the values were 2's complement signed integers; matching JavaScript's built-in BigInt operators.

#### `+`, `-`, `*`, `/`

Same as the `#add`, `#sub`, `#mul`, `#div` methods.

#### `%`

Returns the remainder of the lhs and rhs.

> Note: The `%` operator is not the same as the `#mod` method. The `%` operator returns the `#rem` of the division of the lhs and rhs, while the `#mod` method returns the modulo of the lhs and rhs; matching JavaScript's built-in BigInt operator.

#### `<<`, `>>`

Returns the result of the left/right shift of the lhs by the rhs.

> Note: The `<<`/`>>` operators are not the same as the `#bitShift` method. The operators return the result of the shift as if the lhs was a 2's complement signed integer; matching JavaScript's built-in BigInt operators.

#### `&`, `|`, `^`

Returns the result of the bitwise `and`/`or`/`xor` of the lhs and rhs.

> Note: The `&`/`|`/`^` operators are not the same as the `#and`/`#or`/`#xor` methods. The operators return the result of the bitwise and/or/xor as if the values were 2's complement signed integers; matching JavaScript's built-in BigInt operators.

## License

MIT License

Copyright (c) 2024 Jayson Harshbarger

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
