import t from 'tap';
import { t_shl, t_shr, t_shr_op, t_shl_op } from './setup.js';
import fc from 'fast-check';

fc.configureGlobal({ numRuns: 200 });

const shift = (n, m) => {
  return n < 0n ? -(-n >> m) : n >> m;
};

const examples = [
  [1n, -1n],
  [-1n, 1n],
  [1n, 1n],
  [-1n, -1n],
  [0xdeadbeefn, 1n],
  [0xdeadbeefn, 8n],
  [0xdeadbeefn, 32n],
  [0xdeadbeefn, 64n],
  [-0xdeadbeefn, 64n],
];

t.test('shl', (t) => {
  fc.assert(
    fc.property(fc.bigIntN(4096), fc.bigIntN(16), (n, m) => {
      t.equal(t_shl(n, Number(m)), m < 0n ? n / 2n ** -m : n * 2n ** m);
      t.equal(t_shl(n, Number(m)), shift(n, -m));
    }),
    { examples },
  );

  t.end();
});

t.test('shr', (t) => {
  fc.assert(
    fc.property(fc.bigIntN(4096), fc.bigIntN(16), (n, m) => {
      t.equal(t_shr(n, Number(m)), m < 0n ? n * 2n ** -m : n / 2n ** m);
      t.equal(t_shr(n, Number(m)), shift(n, m));
    }),
    { examples },
  );

  t.end();
});

t.test('<<', (t) => {
  fc.assert(
    fc.property(fc.bigIntN(4096), fc.bigIntN(15), (n, m) => {
      t.equal(t_shl_op(n, Number(m)), n << m);
    }),
    { examples },
  );

  t.end();
});

t.test('>>', (t) => {
  fc.assert(
    fc.property(fc.bigIntN(4096), fc.bigIntN(15), (n, m) => {
      t.equal(t_shr_op(n, Number(m)), n >> m);
    }),
    { examples },
  );

  t.end();
});

t.end();
