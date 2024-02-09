import t from 'tap';
import { t_log2, t_log10 } from './setup.js';
import fc from 'fast-check';

fc.configureGlobal({ numRuns: 300 });

const M = 2n ** 4096n;

function log(k, n) {
  return BigInt(n.toString(k).length - 1);
}

t.test('log2', t => {
  fc.assert(
    fc.property(fc.bigInt({ min: 1n, max: M }), n => {
      t.equal(t_log2(n), log(2, n));
    })
  );

  // Identity
  fc.assert(
    fc.property(fc.bigInt(1n, 1000n), n => {
      t.equal(t_log2(2n ** n), n);
    })
  );

  t.end();
});

t.test('log10', t => {
  fc.assert(
    fc.property(fc.bigInt({ min: 1n, max: M }), n => {
      t.equal(t_log10(n), log(10, n));
    })
  );

  // Identity
  fc.assert(
    fc.property(fc.bigInt(1n, 1000n), n => {
      t.equal(t_log10(10n ** n), n);
    })
  );

  t.end();
});
