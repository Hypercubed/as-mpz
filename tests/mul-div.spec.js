import t from 'tap';
import { mpz, t_mul, t_div, random } from './setup.js';

const N = 500; // number of random iterations
const M = 2 ** 7; // number of limbs

t.test('multiplication', (t) => {
  t.test('n>0, m>0', (t) => {
    t.equal(t_mul(0, 0), 0n);
    t.equal(t_mul(1, 1), 1n);
    t.equal(t_mul(0x10, 0x10), 0x100n);
    t.equal(t_mul('0xffff', '0xffff'), 0xfffe0001n);
    t.equal(t_mul('0xffffffff', '0xffffffff'), 0xfffffffe00000001n);

    t.equal(
      t_mul(
        '0x2E75F2AA067132A276C13262E7268D7CECC8190A00000',
        '0x35F29E388C20BFBAC4964BFBA000',
      ),
      0x9ca7373a70ffde7fc610fc43850f3bb95922dd391b0c36b388502f72f5f8a74400000000n,
    );

    t.end();
  });

  t.test('n<0, m<0', (t) => {
    t.equal(t_mul(-0x10, -0x10), 0x100n);
    t.equal(t_mul('-0xffff', '-0xffff'), 0xfffe0001n);
    t.equal(t_mul('-0xffffffff', '-0xffffffff'), 0xfffffffe00000001n);
    t.end();
  });

  t.test('n>0, m<0', (t) => {
    t.equal(t_mul(0x10, -0x10), -0x100n);
    t.equal(t_mul('0xffff', '-0xffff'), -0xfffe0001n);
    t.equal(t_mul('0xffffffff', '-0xffffffff'), -0xfffffffe00000001n);
    t.end();
  });

  t.test('n<0, m>0', (t) => {
    t.equal(t_mul(-0x10, 0x10), -0x100n);
    t.equal(t_mul('-0xffff', '0xffff'), -0xfffe0001n);
    t.equal(t_mul('-0xffffffff', '0xffffffff'), -0xfffffffe00000001n);
    t.end();
  });

  t.test('fuzzing', async (t) => {
    for (let i = 0; i < N; i++) {
      const n = random(M);
      const m = random(M);
      t.equal(t_mul(n, m), n * m);
    }

    // very large
    const a = random(2 ** 12);
    const b = random(2 ** 12);
    t.equal(t_mul(a, b), a * b);

    t.end();
  });

  t.end();
});

t.test('division', (t) => {
  t.test('m=1', (t) => {
    t.equal(t_div(1, 1), 1n);
    t.equal(t_div(2, 1), 2n);
    t.equal(t_div(4, 1), 4n);
    t.end();
  });

  t.test('n<m', (t) => {
    t.equal(t_div(2, 4), 0n);
    t.equal(t_div(0xffffffffffffffffn, 0xfffffffffffffffffn), 0n);
    t.end();
  });

  t.test('n=m', (t) => {
    t.equal(t_div(2, 2), 1n);
    t.equal(t_div(0xffffffffffffffffn, 0xffffffffffffffffn), 1n);
    t.end();
  });

  t.test('1<m<0xFFFFFFFF, 1<n<0xFFFFFFFF', (t) => {
    t.equal(t_div(2, 2), 1n);
    t.equal(t_div(4, 2), 2n);
    t.equal(t_div(8, 2), 4n);

    t.equal(t_div('0xbeef', '16'), 0xbeen);
    t.equal(t_div('0x1000', 0x10), 0x100n);
    t.equal(t_div('0x10000000', 0x10), 0x1000000n);
    t.equal(t_div('0xDEADBEEF', '16'), 0xdeadbeen);
    t.equal(t_div('0xDEADBEEF', '0x100'), 0xdeadben);
    t.equal(t_div('0xDEADBEEF', '0x10000000'), 0xdn);
    t.equal(t_div('0xFFFFFFFF', '0xf'), 0x11111111n);
    t.equal(t_div('0xFFFFFFFF', '0xffffffff'), 0x1n);
    t.equal(t_div('0xFFFFFFFF', '0xfffffff'), 0x10n);

    t.end();
  });

  t.test('n>0xFFFFFFFF, 1<m<0xFFFFFFFF', (t) => {
    t.equal(t_div('0xDEADBEEFDEADBEEF', 1), 0xdeadbeefdeadbeefn);
    t.equal(t_div('0xdeadbeefdeadbeef', 0x10), 0xdeadbeefdeadbeen);
    t.equal(t_div('0xdeadbeefdeadbeef', '0x100'), 0xdeadbeefdeadben);
    t.equal(t_div('0xFFFFFFFFFFFFFFFF', '0xf'), 0x1111111111111111n);
    t.equal(t_div('0xFFFFFFFFFFFFFFFF', '0xffffffff'), 0x100000001n);
    t.equal(t_div('0xFFFFFFFFFFFFFFFF', '0xfffffff'), 0x1000000100n);
    t.end();
  });

  t.test('n>m>0xFFFFFFFF', (t) => {
    t.equal(t_div('0xFFFFFFFFFFFFFFFF', '0xFFFFFFFFFFFFFFF'), 0x10n);
    t.equal(t_div('0xFFFFFFFFFFFFFFFF', '0xFFFFFFFFFFFFF'), 0x1000n);

    t.equal(t_div('0xFFFFFFFFFFFFFFFFFFFF', '0xFFFFFFFFFFFFFFFFFFF'), 0x10n);
    t.equal(t_div('0xFFFFFFFFFFFFFFFFFFFF', '0xFFFFFFFFFFFFFFFFF'), 0x1000n);

    t.equal(
      t_div('0xDEADBEEFDEADBEEF00000000', 0xdeadbeefdeadbeef0000n),
      0x10000n,
    );

    t.end();
  });

  t.test('special case requiring two D6 steps in Algorithm D', (t) => {
    const n = 34125305527818743474129076526n;
    const m = 9580783237862390338n;
    t.equal(t_div(n, m), n / m);

    t.end();
  });

  t.test('special cases', (t) => {
    let n = 0x100229888f0870594265f617feeb3bb879c7d35ecd04fn;
    let m = 2n**89n - 1n;
    t.equal(t_div(n, m), n / m);

    n = 0x3ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff80000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffn;
    m = 2n**521n - 1n;
    t.equal(t_div(n, m), n / m);

    t.end();
  });

  t.test('fuzzing', async (t) => {
    for (let i = 0; i < N; i++) {
      const n = random(M);
      const m = random(M) || 1n;
      t.equal(t_div(n, m), n / m);
    }
    t.end();
  });

  t.end();
});

t.test('mul-div invariants', (t) => {
  for (let i = 0; i < N; i++) {
    const n = mpz.from(String(random(M)));
    const d = mpz.from(String(random(M) || 1n));

    const q = mpz.div(n, d);
    const m = mpz.rem(n, d);
    const r = mpz.add(mpz.mul(q, d), m);
    t.equal(mpz.toHex(r), mpz.toHex(n));
  }
  t.end();
});
