import t from 'tap';
import { t_string, t_hex, t_exponential, BigIntMath } from './setup.js';
import fc from 'fast-check';

fc.configureGlobal({ numRuns: 200 });
const N = 4096; // 2**31-1 max

t.test('toString', t => {
  t.test('toString(10)', t => {
    t.equal(t_string('0'), '0');
    t.equal(t_string('-0xbeef'), '-48879');
    t.equal(t_string('0xdeadbeef'), '3735928559');

    fc.assert(
      fc.property(fc.bigIntN(N), n => {
        t.equal(t_string(n), n.toString());
      })
    );

    t.end();
  });

  t.test('toString(16)', t => {
    t.equal(t_string('0', 16), '0');
    t.equal(t_string('-0xbeef', 16), '-beef');
    t.equal(t_string('0xdeadbeef', 16), 'deadbeef');

    fc.assert(
      fc.property(fc.bigIntN(N), n => {
        t.equal(t_string(n, 16), n.toString(16));
      })
    );

    t.end();
  });

  t.test('toString(-16)', t => {
    t.equal(t_string('0', -16), '0');
    t.equal(t_string('-0xbeef', -16), '-BEEF');
    t.equal(t_string('0xdeadbeef', -16), 'DEADBEEF');

    fc.assert(
      fc.property(fc.bigIntN(N), n => {
        t.equal(t_string(n, -16), n.toString(16).toUpperCase());
      })
    );

    t.end();
  });

  t.test('toString(2)', t => {
    t.equal(t_string('0', 2), '0');
    t.equal(t_string('-0xbeef', 2), '-1011111011101111');
    t.equal(t_string('0xdeadbeef', 2), '11011110101011011011111011101111');
    t.equal(t_string('-0xdeadbeef', 2), '-11011110101011011011111011101111');

    fc.assert(
      fc.property(fc.bigIntN(N), n => {
        t.equal(t_string(n, 2), n.toString(2));
      })
    );

    t.end();
  });

  t.end();
});

t.test('toHex', t => {
  t.equal(t_hex('0'), '0x0');

  t.equal(t_hex('3'), '0x3');
  t.equal(t_hex('0xdeadbeef'), '0xdeadbeef');
  t.equal(t_hex('3735928559'), '0xdeadbeef');
  t.equal(t_hex('0xdeadbeefdeadbeef'), '0xdeadbeefdeadbeef');
  t.equal(
    t_hex('0xdeadbeefdeadbeefdeadbeefdeadbeef'),
    '0xdeadbeefdeadbeefdeadbeefdeadbeef'
  );

  t.equal(t_hex(-3), '-0x3');
  t.equal(t_hex('-0xdeadbeef'), '-0xdeadbeef');
  t.equal(t_hex('-3735928559'), '-0xdeadbeef');
  t.equal(t_hex('-0xdeadbeefdeadbeef'), '-0xdeadbeefdeadbeef');
  t.equal(
    t_hex('-0xdeadbeefdeadbeefdeadbeefdeadbeef'),
    '-0xdeadbeefdeadbeefdeadbeefdeadbeef'
  );

  t.equal(
    t_hex('3735928559373592855937359285593735928559'),
    '0xafa99ab130406c288189c7f3658ef9aef'
  );

  fc.assert(
    fc.property(fc.bigIntN(N), n => {
      t.equal(t_hex(n, 2), BigIntMath.toHex(n));
    })
  );

  t.end();
});

t.test('toExponential', t => {
  fc.assert(
    fc.property(fc.bigIntN(N), fc.integer({ min: 0, max: 200 }), (n, m) => {
      t.equal(t_exponential(n, m), BigIntMath.toExponential(n, m));
    }),
    {
      examples: [
        [0, 0],
        [38831928, 8], // causes rounding error if converted to a float
        [-474130365, 7], // causes rounding difference when fp === 0.5
        [474130365, 7], // causes rounding difference when fp === 0.5
        [995163856, 1] // causes carry after rounding
      ]
    }
  );

  t.end();
});

t.end();
