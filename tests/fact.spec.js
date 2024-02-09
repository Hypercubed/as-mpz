import t from 'tap';
import { t_fact } from './setup.js';
import fc from 'fast-check';

fc.configureGlobal({ numRuns: 100 });

const N = 4096;

function calculateFactorial(n) {
  if (n < 2n) return 1n;
  var fact = 1n;
  for (let i = 2n; i <= n; i++) {
    fact *= i;
  }
  return fact;
}

t.test('factorials', t => {
  fc.assert(
    fc.property(fc.integer({ min: 5, max: N }), n => {
      t.equal(t_fact(n), calculateFactorial(BigInt(n)));
    }),
    {
      examples: [[0], [1], [10], [100], [1000]]
    }
  );

  t.end();
});

t.end();
