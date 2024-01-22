import t from 'tap';
import { t_string, t_hex } from './setup.js';

t.test('toString', t => {
  t.test('toString(10)', t => {
    t.equal(t_string('0'), '0');
    t.equal(t_string('-0xbeef'), '-48879');
    t.equal(t_string('0xdeadbeef'), '3735928559');

    t.end();
  });

  t.test('toString(16)', t => {
    t.equal(t_string('0', 16), '0');
    t.equal(t_string('-0xbeef', 16), '-beef');
    t.equal(t_string('0xdeadbeef', 16), 'deadbeef');

    t.end();
  });

  t.test('toString(-16)', t => {
    t.equal(t_string('0', -16), '0');
    t.equal(t_string('-0xbeef', -16), '-BEEF');
    t.equal(t_string('0xdeadbeef', -16), 'DEADBEEF');

    t.end();
  });

  t.test('toString(2)', t => {
    t.equal(t_string('0', 2), '0');
    t.equal(t_string('-0xbeef', 2), '-1011111011101111');
    t.equal(t_string('0xdeadbeef', 2), '11011110101011011011111011101111');

    t.end();
  });

  t.end();
});

t.test('toHex', t => {
  t.test('toHex()', t => {
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

    t.end();
  });
  t.end();
});

t.end();
