import t from 'tap';
import { t_gcd, t_lcm, BigIntMath } from './setup.js';
import fc from 'fast-check';

fc.configureGlobal({ numRuns: 100 });

const N = 4096;

t.test('gcd', t => {
  fc.assert(
    fc.property(fc.bigIntN(N), fc.bigIntN(N), (n, m) => {
      t.equal(t_gcd(n, m), BigIntMath.gcd(n, m));
    })
  );

  t.end();
});

t.test('lcm', t => {
  fc.assert(
    fc.property(fc.bigIntN(N), fc.bigIntN(N), (n, m) => {
      t.equal(t_lcm(n, m), BigIntMath.lcm(n, m));
    })
  );

  t.end();
});

t.end();
