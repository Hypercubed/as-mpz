import t from 'tap';
import { t_gcd, t_lcm } from './setup.js';
import fc from 'fast-check';

fc.configureGlobal({ numRuns: 100 });

function gcd(a, b) {
  if (a < 0n) a = -a;
  if (b < 0n) b = -b;

  if (!b) return a;
  return gcd(b, a % b);
}

function lcm(a, b) {
  if (a === 0n || b === 0n) return 0n;
  if (a < 0n) a = -a;
  if (b < 0n) b = -b;

  return (a * b) / gcd(a, b);
}

t.test('gcd', t => {
  fc.assert(
    fc.property(fc.bigIntN(4096), fc.bigIntN(4096), (n, m) => {
      t.equal(t_gcd(n, m), gcd(n, m));
    })
  );

  t.end();
});

t.test('lcm', t => {
  fc.assert(
    fc.property(fc.bigIntN(4096), fc.bigIntN(4096), (n, m) => {
      t.equal(t_lcm(n, m), lcm(n, m));
    })
  );

  t.end();
});

t.end();
