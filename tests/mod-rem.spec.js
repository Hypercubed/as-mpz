import t from 'tap';
import { t_rem, t_mod } from './setup.js';
import fc from 'fast-check';

fc.configureGlobal({ numRuns: 300 });

t.test('rem', (t) => {
  fc.assert(
    fc.property(fc.bigIntN(4096), fc.bigIntN(4096), (n, m) => {
      m = m || 1n;
      t.equal(t_rem(n, m), n % m);
    }),
    {
      examples: [
        [10000n, 7n],
        [10000n, -7n],
        [-10000n, 7n],
        [-10000n, -7n],
      ],
    },
  );

  t.end();
});

t.test('modulo', (t) => {
  fc.assert(
    fc.property(fc.bigIntN(4096), fc.bigIntN(4096), (n, m) => {
      m = m || 1n;
      t.equal(t_mod(n, m), mod(n, m));
    }),
    {
      examples: [
        [10000n, 7n],
        [10000n, -7n],
        [-10000n, 7n],
        [-10000n, -7n],
      ],
    },
  );

  t.end();
});

function mod(n, m) {
  return ((n % m) + m) % m;
}
