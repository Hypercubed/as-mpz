import t from 'tap';
import { t_log2 } from './setup.js';
import fc from 'fast-check';

fc.configureGlobal({ numRuns: 300 });

function log2(n) {
  if (n < Number.MAX_SAFE_INTEGER) {
    const x = Number(n);
    return BigInt(Math.floor(Math.log2(x)));
  }
  return BigInt(n.toString(2).length - 1);
}

t.test('log2', t => {
  fc.assert(
    fc.property(fc.bigInt({ min: 1n, max: 2n ** 4096n }), n => {
      t.equal(t_log2(n), log2(n));
    })
  );

  // Identity
  fc.assert(
    fc.property(fc.bigInt(1n, 2n ** 8n), n => {
      t.equal(t_log2(2n ** n), n);
    })
  );

  t.end();
});
