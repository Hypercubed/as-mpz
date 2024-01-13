# as-mpz

Arbitrary precision integer library for AssemblyScript.

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

## API

### Constructor

#### `MpZ.from(value: i32 | u32 | i64 | u64 | string): MpZ`

Create a new MpZ from a number or string.

### Properties

#### `#isNeg: boolean`

Returns true if the MpZ is negative.

### Unary Operators

#### `#abs(): MpZ`

Returns the absolute value of the MpZ.

#### `#neg(): MpZ`

Returns the negated value of the MpZ.

#### `#eqz(): bool`

Returns true if the MpZ is zero.

### Binary Operators

#### `#add(rhs: MpZ | i32 | u32 | i64 | u64 | string): MpZ`

Returns the sum of the MpZ and rhs.

#### `#sub(rhs: MpZ | i32 | u32 | i64 | u64 | string): MpZ`

Returns the difference of the MpZ and rhs.

#### `#mul(rhs: MpZ | i32 | u32 | i64 | u64 | string): MpZ`

Returns the product of the MpZ and rhs.

#### `#div(rhs: MpZ | i32 | u32 | i64 | u64 | string): MpZ`

Returns the quotient of the MpZ and rhs.

#### `#mod(rhs: MpZ | i32 | u32 | i64 | u64 | string): MpZ`

Returns the modulo of the MpZ and rhs.

#### `#pow(rhs: MpZ | i32 | u32 | i64 | u64 | string): MpZ`

Returns the power of the MpZ and rhs.

#### `#cmp(rhs: MpZ | i32 | u32 | i64 | u64 | string): i32`

Returns the comparison of the MpZ and rhs. A `1` if the MpZ is greater than `rhs`, `-1` if the MpZ is less than `rhs`, and `0` if the MpZ equals the `rhs`.

#### `#eq(rhs: MpZ | i32 | u32 | i64 | u64 | string): boolean`

Returns `true` if the MpZ and rhs are equal.

#### `#neq(rhs: MpZ | i32 | u32 | i64 | u64 | string): boolean`

Returns `true` if the MpZ and rhs are not equal.

#### `#lt(rhs: MpZ | i32 | u32 | i64 | u64 | string): boolean`

Returns `true` if the MpZ is less than rhs.

#### `#lte(rhs: MpZ | i32 | u32 | i64 | u64 | string): boolean`

Returns `true` if the MpZ is less than or equal to rhs.

#### `#gt(rhs: MpZ | i32 | u32 | i64 | u64 | string): boolean`

Returns `true` if the MpZ is greater than rhs.

#### `#gte(rhs: MpZ | i32 | u32 | i64 | u64 | string): boolean`

Returns `true` if the MpZ is greater than or equal to rhs.

## License

MIT License

Copyright (c) 2024 Jayson Harshbarger

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
