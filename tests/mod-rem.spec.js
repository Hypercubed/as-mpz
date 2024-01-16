import t from 'tap';
import { t_rem, t_mod } from './setup.js';
import fc from 'fast-check';

fc.configureGlobal({ numRuns: 300 });

t.test('rem', (t) => {
  t.equal(t_rem('10000', '7'), 4n);
  t.equal(t_rem('-10000', '7'), -4n);
  t.equal(t_rem('10000', '-7'), 4n);
  t.equal(t_rem('-10000', '-7'), -4n);

  t.test('fuzzing', async (t) => {
    fc.assert(
      fc.property(fc.bigIntN(5000), fc.bigIntN(5000), (n, m) => {
        m = m || 1n;
        t.equal(t_rem(n, m), n % m);
      }),
    );
    t.end();
  });

  t.end();
});

t.test('modulo', (t) => {
  t.equal(t_mod('10000', '7'), 4n);
  t.equal(t_mod('-10000', '7'), 3n);
  t.equal(t_mod('10000', '-7'), -3n);
  t.equal(t_mod('-10000', '-7'), -4n);

  t.end();
});
