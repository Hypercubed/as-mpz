# {{ pkg.name }}

{{ pkg.description }}

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
> However, unlike instance methods, the operators do not coerce inputs to an MpZ.

{{ load:docs/api/index.md }}

{{ template:license }}
{{ load:LICENSE.md }}
