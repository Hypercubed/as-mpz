import t from 'tap';
import { t_cmp } from './setup.js';
import fc from 'fast-check';

fc.configureGlobal({ numRuns: 300 });
const N = 2 ** 12; // 2**31-1 max

t.test('compareTo', async t => {
  fc.assert(
    fc.property(fc.bigIntN(N), fc.bigIntN(N), (n, m) => {
      t.equal(t_cmp(n, m), n > m ? 1 : n < m ? -1 : 0);
    }),
    {
      examples: [
        // positive
        [0n, 0n],
        [3n, 1n],
        [1n, 3n],
        [3n, 3n],
        [3n, 5n],
        [5n, 3n],
        [0xdead0000n, 0x0000beefn],
        [0x0000beefn, 0xdead0000n],

        // n<0, m<0
        [-3n, 1n],
        [-1n, 3n],
        [-3n, -3n],
        [-3n, -5n],
        [-5n, -3n],
        [-0xdead0000n, -0x0000beefn],
        [-0x0000beefn, -0xdead0000n],

        // n>0, m<0
        [3n, -1n],
        [1n, -3n],
        [3n, -3n],
        [3n, -5n],
        [5n, -3n],
        [0xdead0000n, -0x0000beefn],
        [0x0000beefn, -0xdead0000n],

        // n<0, m>0
        [-3n, 1n],
        [-1n, 3n],
        [-3n, 3n],
        [-3n, 5n],
        [-5n, 3n],
        [-0xdead0000n, 0x0000beefn],
        [-0x0000beefn, 0xdead0000n]
      ]
    }
  );

  t.end();
});

t.end();
