import t from 'tap';
import { mpz, t_add, t_sub, random } from './setup.js';

const N = 1000; // number of random iterations
const M = 2 ** 7; // max number of limbs

t.test('addition', (t) => {
  t.test('positive', (t) => {
    t.equal(t_add(0, 0), 0n);
    t.equal(t_add(3, 5), 8n);
    t.equal(t_add('0xdead0000', '0x0000beef'), 0xdeadbeefn);
    t.equal(
      t_add('0x00000000deadbeef', '0xdeadbeef00000000'),
      0xdeadbeefdeadbeefn,
    );

    t.equal(t_add('2950793089775236', '2160715205785584'), 0x1228e3c4392e74n);
    t.equal(t_add('403105631078710', '3402969886132728'), 3806075517211438n);
    t.end();
  });

  t.test('negitive (rhs<0)', (t) => {
    t.equal(t_add(8, -3), 5n);
    t.equal(t_add(3, -8), -5n);
    t.equal(t_add('0xdeadbeef', '-0x0000beef'), 0xdead0000n);
    t.end();
  });

  t.test('negitive (lhs<0, rhs<0)', (t) => {
    t.equal(t_add(-8, -3), -11n);
    t.equal(t_add(-3, -8), -11n);
    t.equal(t_add(-0xdead0000, -0x0000beef), -0xdeadbeefn);
    t.end();
  });

  t.test('fuzzing', async (t) => {
    for (let i = 0; i < N; i++) {
      const n = random(M);
      const m = random(M);
      t.equal(t_add(n, m), n + m);
    }

    // very large
    const a = random(2 ** 12);
    const b = random(2 ** 12);
    t.equal(t_add(a, b), a + b);

    t.end();
  });

  t.end();
});

t.test('subtraction', (t) => {
  t.test('lhs>rhs>0', (t) => {
    t.equal(t_sub(8, 5), 0x3n);
    t.equal(t_sub(0xdead0000, 0x0000beef), 0xdeac4111n);
    t.equal(t_sub(0xdeadbeef, 0xbeef), 0xdead0000n);
    t.equal(t_sub(0xdeadbeefdeadbeefn, 0xdeadbeef00000000n), 0xdeadbeefn);
    t.end();
  });

  t.test('rhs>lhs>0)', (t) => {
    t.equal(t_sub(5, 8), -3n);
    t.end();
  });

  t.test('rhs<0, |lhs|>|rhs|', (t) => {
    t.equal(t_sub(8, -3), 11n);
    t.equal(t_sub(0xdead0000, -0x0000beef), 0xdeadbeefn);
    t.equal(t_sub(2779068574725052, -2776491312893844), 0x13bcc095a14350n);
    t.end();
  });

  t.test('rhs<0, |rhs|>|lhs|', (t) => {
    t.equal(t_sub(3, -8), 11n);
    t.end();
  });

  t.test('lhs<rhs<0', (t) => {
    t.equal(t_sub(-8, -3), -0x5n);
    t.equal(t_sub(-3, -8), 0x5n);
    t.equal(t_sub(-0xdeadbeef, -0x0000beef), -0xdead0000n);
    t.end();
  });

  t.test('rhs<lhs<0', (t) => {
    t.equal(t_sub(-3, -8), 0x5n);
    t.end();
  });

  t.test('fuzzing', async (t) => {
    for (let i = 0; i < N; i++) {
      const n = random(M);
      const m = random(M);
      t.equal(t_sub(n, m), n - m);
    }
    t.end();
  });

  t.end();
});

t.test('invariants', (t) => {
  for (let i = 0; i < N; i++) {
    const n = random(M);
    const m = random(M);

    const r = mpz.add(mpz.from(n), mpz.from(m));
    const s = mpz.sub(r, mpz.from(m));

    t.equal(mpz.toHex(r), mpz.toHex(s));
  }
  t.end();
});
