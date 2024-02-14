import t from 'tap';
import { t_fact, BigIntMath } from './setup.js';
import fc from 'fast-check';

fc.configureGlobal({ numRuns: 100 });

const N = 4096;

t.test('factorials', t => {
  fc.assert(
    fc.property(fc.integer({ min: 5, max: N }), n => {
      t.equal(t_fact(n), BigIntMath.fact(BigInt(n)));
    }),
    {
      examples: [[0], [1], [10], [100], [1000]]
    }
  );

  t.end();
});

t.end();
