import t from 'tap';
import { toHex, t_string, t_hex } from './setup.js';
import fc from 'fast-check';

fc.configureGlobal({ numRuns: 300 });

t.test('toString', (t) => {
  t.test('toString(10)', (t) => {
    t.equal(t_string('0'), '0');
    t.equal(t_string('0xdeadbeef'), '3735928559');

    t.end();
  });

  t.test('toString(16)', (t) => {
    t.equal(t_string('0', 16), '0');
    t.equal(t_string('0xdeadbeef', 16), 'deadbeef');

    t.end();
  });

  t.test('toString(-16)', (t) => {
    t.equal(t_string('0', 16), '0');
    t.equal(t_string('0xdeadbeef', -16), 'DEADBEEF');

    t.end();
  });

  t.end();
});

t.test('toHex', (t) => {
  t.test('toHex()', (t) => {
    t.equal(t_hex('0'), '0x0');

    t.equal(t_hex('3'), '0x3');
    t.equal(t_hex('0xdeadbeef'), '0xdeadbeef');
    t.equal(t_hex('3735928559'), '0xdeadbeef');
    t.equal(t_hex('0xdeadbeefdeadbeef'), '0xdeadbeefdeadbeef');
    t.equal(
      t_hex('0xdeadbeefdeadbeefdeadbeefdeadbeef'),
      '0xdeadbeefdeadbeefdeadbeefdeadbeef',
    );

    t.equal(t_hex(-3), '-0x3');
    t.equal(t_hex('-0xdeadbeef'), '-0xdeadbeef');
    t.equal(t_hex('-3735928559'), '-0xdeadbeef');
    t.equal(t_hex('-0xdeadbeefdeadbeef'), '-0xdeadbeefdeadbeef');
    t.equal(
      t_hex('-0xdeadbeefdeadbeefdeadbeefdeadbeef'),
      '-0xdeadbeefdeadbeefdeadbeefdeadbeef',
    );

    t.equal(
      t_hex('3735928559373592855937359285593735928559'),
      '0xafa99ab130406c288189c7f3658ef9aef',
    );

    t.end();
  });

  t.test('fuzzing', async (t) => {
    fc.assert(
      fc.property(fc.bigIntN(5000), fc.bigIntN(5000), (n, m) => {
        t.equal(t_hex(n), toHex(n));
      }),
    );

    t.end();
  });

  t.end();
});

t.end();
