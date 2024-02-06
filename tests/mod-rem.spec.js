import t from 'tap';
import { t_rem, t_mod } from './setup.js';
import fc from 'fast-check';

fc.configureGlobal({ numRuns: 400 });
const N = 2 ** 12; // 2**31-1 max

t.test('rem', t => {
  fc.assert(
    fc.property(fc.bigIntN(N), fc.bigIntN(N), (n, m) => {
      m = m || 1n;
      t.equal(t_rem(n, m), n % m);
    }),
    {
      examples: [
        [10n, 1n],
        [10n, -1n],
        [-10n, 1n],
        [-10n, -1n],
        [10000n, 7n],
        [10000n, -7n],
        [-10000n, 7n],
        [-10000n, -7n]
      ]
    }
  );

  t.end();
});

t.test('modulo', t => {
  fc.assert(
    fc.property(fc.bigIntN(N), fc.bigIntN(N), (n, m) => {
      // const a = t_mod(n, m);
      // const b = mod(n, m);
      // if (a !== b) {
      //   console.log({ n, m, a, b });
      // }
      m = m || 1n;
      t.equal(t_mod(n, m), mod(n, m));
    }),
    {
      examples: [
        [10n, 1n],
        [10n, -1n],
        [-10n, 1n],
        [-10n, -1n],
        [10000n, 7n],
        [10000n, -7n],
        [-10000n, 7n],
        [-10000n, -7n]
      ]
    }
  );

  t.end();
});

t.end();

// identity ((x/y))*y + x%y - x == 0

function mod(n, m) {
  return ((n % m) + m) % m;
}
