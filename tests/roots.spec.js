import t from 'tap';
import { t_sqrt, t_root } from './setup.js';
import fc from 'fast-check';

fc.configureGlobal({ numRuns: 300 });

t.test('isqrt', t => {
  fc.assert(
    fc.property(fc.integer({ min: 1 }), n => {
      t.equal(t_sqrt(n), BigInt(Math.pow(n, 1 / 2) | 0));
    })
  );

  // // Identity
  // fc.assert(
  //   fc.property(fc.bigInt(1n, 2n**64n), n => {
  //     t.equal(t_sqrt(n**2n), n);
  //   })
  // );

  t.end();
});

t.test('root', t => {
  fc.assert(
    fc.property(fc.integer(), fc.integer({ min: 1, max: 25 }), (n, m) => {
      if (n < 0 && m % 2 === 0) return;
      t.equal(
        t_root(n, m),
        BigInt((Math.sign(n) * Math.pow(Math.abs(n), 1 / m)) | 0)
      );
    }),
    {
      examples: [
        [-7, 3],
        [7, 3],
        [15, 2],
        [22, 3]
      ]
    }
  );

  // // Identity
  // fc.assert(
  //   fc.property(fc.bigInt(1n, 2n**64n), fc.integer({ min: 1, max: 10 }), (n, m) => {
  //     t.equal(t_root(n**BigInt(m), m), n);
  //   })
  // );

  t.end();
});
