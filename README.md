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

> Note: Arithmatic methods and operators can be used interchangably, with operators acting as shorthand for the methods. However, the bitwise operators (`&`, `|`, `^`, `>>`, `<<`) are not the same as the bitwise methods (`#and`, `#or`, `#xor`, `#shift`). The methods return the result of the bitwise operation on the sign-magnitute integer; treatsing the sign seperate from the magnitude. Conversely, the operators return the result of the bitwise operation as if the MpZ was a 2's complement signed integer matching JavaScripts BigInt operators. The difference is subtle, but important for negitive numbers. See the API section for more details.

## API

### Constructor

#### `MpZ.from(value: i32 | u32 | i64 | u64 | string): MpZ`

Create a new MpZ from a number or string. The MpZ class should not be instantiated directly (using `new`). Instead use the static `MpZ.from` method to create a new MpZ. The `MpZ.from` method accepts a number or string. The string can be in decimal or hexadecimal format (prefixed with `0x`). The string can also be prefixed with `-` to indicate a negative number.

### Properties

#### `#isNeg: boolean`

Returns true if the MpZ is negative.

### Unary Methods

#### `#abs(): MpZ`

Returns the absolute value of the MpZ.

#### `#neg(): MpZ`

Returns the negated value of the MpZ.

#### `#eqz(): boolean`

Returns true if the MpZ is zero.

### Binary Methods

#### `#add(rhs: MpZ | i32 | u32 | i64 | u64 | string): MpZ`

Returns the sum of the MpZ and rhs.

#### `#sub(rhs: MpZ | i32 | u32 | i64 | u64 | string): MpZ`

Returns the difference of the MpZ and rhs.

#### `#mul(rhs: MpZ | i32 | u32 | i64 | u64 | string): MpZ`

Returns the product of the MpZ and rhs.

#### `#div(rhs: MpZ | i32 | u32 | i64 | u64 | string): MpZ`

Returns the quotient of the MpZ and rhs truncated towards zero.

#### `#mod(rhs: MpZ | i32 | u32 | i64 | u64 | string): MpZ`

Returns the modulo of the MpZ and rhs.

#### `#pow(rhs: MpZ | i32 | u32 | i64 | u64 | string): MpZ`

Returns the power of the MpZ and rhs.

#### `#cmp(rhs: MpZ | i32 | u32 | i64 | u64 | string): i32`

Returns the comparison of the MpZ and rhs. Returns a `1` if the MpZ is greater than `rhs`, `-1` if the MpZ is less than `rhs`, and `0` if the MpZ equals the `rhs`.

#### `#eq(rhs: MpZ | i32 | u32 | i64 | u64 | string): boolean`

Returns `true` if the MpZ and rhs are equal (same value).

#### `#ne(rhs: MpZ | i32 | u32 | i64 | u64 | string): boolean`

Returns `true` if the MpZ and rhs are not equal (not the same value).

#### `#lt(rhs: MpZ | i32 | u32 | i64 | u64 | string): boolean`

Returns `true` if the MpZ is less than rhs.

#### `#le(rhs: MpZ | i32 | u32 | i64 | u64 | string): boolean`

Returns `true` if the MpZ is less than or equal to rhs.

#### `#gt(rhs: MpZ | i32 | u32 | i64 | u64 | string): boolean`

Returns `true` if the MpZ is greater than rhs.

#### `#ge(rhs: MpZ | i32 | u32 | i64 | u64 | string): boolean`

Returns `true` if the MpZ is greater than or equal to rhs.

#### `#and(rhs: MpZ | i32 | u32 | i64 | u64 | string): MpZ`

Returns the bitwise and of the MpZ and rhs magnitude and sign.

> Note: The `#and` method is not the same as the `&` operator. The `#and` method returns the bitwise `and` of the unsigned magnitude of the MpZ and rhs. The signedness of the result is an `and` of the signedness of the MpZ and rhs. The `&` operator returns the result of the bitwise `and` as if the MpZ was a 2's complement signed integer; matching JavaScript's built-in BigInt operator.

#### `#or(rhs: MpZ | i32 | u32 | i64 | u64 | string): MpZ`

Returns the bitwise or of the MpZ and rhs magnitude and sign.

> Note: The `#or` method is not the same as the `|` operator. The `#or` method returns the bitwise `or` of the unsigned magnitude of the MpZ and rhs. The signedness of the result is an `or` of the signedness of the MpZ and rhs. The `|` operator returns the result of the bitwise `or` as if the MpZ was a 2's complement signed integer; matching JavaScript's built-in BigInt operator.

#### `#xor(rhs: MpZ | i32 | u32 | i64 | u64 | string): MpZ`

Returns the bitwise xor of the MpZ and rhs magnitude and sign.

> Note: The `#xor` method is not the same as the `^` operator. The `#xor` method returns the bitwise `xor` of the unsigned magnitude of the MpZ and rhs. The signedness of the result is an `xor` of the signedness of the MpZ and rhs. The `^` operator returns the result of the bitwise `xor` as if the MpZ was a 2's complement signed integer; matching JavaScript's built-in BigInt operator.

### Operators

#### `+`, `-`, `*`, `/`

Same as the `#add`, `#sub`, `#mul`, `#div` methods.

#### `%`

Returns the remainder of the lhs and rhs.

> Note: The `%` operator is not the same as the `#mod` method. The `%` operator returns the `#rem` of the division of the lhs and rhs, while the `#mod` method returns the modulo of the lhs and rhs; matching JavaScript's built-in BigInt operator.

#### `<<`, `>>`

Returns the result of the left/right shift of the lhs by the rhs.

> Note: The `<<`/`>>` operators are not the same as the `#shift` method. The operators return the result of the shift as if the lhs was a 2's complement signed integer; matching JavaScript's built-in BigInt operators.

#### `&`, `|`, `^`

Returns the result of the bitwise `and`/`or`/`xor` of the lhs and rhs.

> Note: The `&`/`|`/`^` operators are not the same as the `#and`/`#or`/`#xor` methods. The operators return the result of the bitwise and/or/xor as if the values were 2's complement signed integers; matching JavaScript's built-in BigInt operators.

## License

MIT License

Copyright (c) 2024 Jayson Harshbarger

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
