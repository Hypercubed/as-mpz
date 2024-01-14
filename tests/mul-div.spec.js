import { readFileSync } from 'node:fs';
import t from 'tap';
import { instantiate } from '../build/debug.js';
import { toHex, random } from './setup.js';

const wasm = readFileSync('./build/debug.wasm');
const module = await WebAssembly.compile(wasm);

let mpz = await instantiate(module, {});

const N = 500; // number of random iterations
const M = 2 ** 7; // number of limbs

t.beforeEach(async () => {
  const module = await WebAssembly.compile(wasm);
  mpz = await instantiate(module, {});
});

const mul = (n, m) => mpz.toHex(mpz.mul(mpz.from(n), mpz.from(m)));

t.test('multiplication', (t) => {
  t.test('n>0, m>0', (t) => {
    t.same(mul('0x0', '0x0'), 0);
    t.same(mul('0x1', '0x1'), 1);
    t.same(mul('0x10', '0x10'), 0x100);
    t.same(mul('0xffff', '0xffff'), 0xfffe0001n);
    t.same(mul('0xffffffff', '0xffffffff'), 0xfffffffe00000001n);

    t.same(
      mul(
        '0x2E75F2AA067132A276C13262E7268D7CECC8190A00000',
        '0x35F29E388C20BFBAC4964BFBA000',
      ),
      '0x9ca7373a70ffde7fc610fc43850f3bb95922dd391b0c36b388502f72f5f8a74400000000',
    );

    t.end();
  });

  t.test('n<0, m<0', (t) => {
    t.same(mul('-0x10', '-0x10'), 0x100);
    t.same(mul('-0xffff', '-0xffff'), 0xfffe0001n);
    t.same(mul('-0xffffffff', '-0xffffffff'), 0xfffffffe00000001n);
    t.end();
  });

  t.test('n>0, m<0', (t) => {
    t.same(mul('0x10', '-0x10'), '-0x100');
    t.same(mul('0xffff', '-0xffff'), '-0xfffe0001');
    t.same(mul('0xffffffff', '-0xffffffff'), '-0xfffffffe00000001');
    t.end();
  });

  t.test('n<0, m>0', (t) => {
    t.same(mul('-0x10', '0x10'), '-0x100');
    t.same(mul('-0xffff', '0xffff'), '-0xfffe0001');
    t.same(mul('-0xffffffff', '0xffffffff'), '-0xfffffffe00000001');
    t.end();
  });

  t.test('fuzzing', async (t) => {
    for (let i = 0; i < N; i++) {
      const n = random(M);
      const m = random(M);
      t.same(mul(String(n), String(m)), toHex(n * m));
    }

    // very large
    const a = random(2 ** 12);
    const b = random(2 ** 12);
    t.same(mul(String(a), String(b)), toHex(a * b));

    t.end();
  });

  t.end();
});

const div = (n, m) => mpz.toHex(mpz.div(mpz.from(n), mpz.from(m)));

t.test('division', (t) => {
  t.test('m=1', (t) => {
    t.same(div('0x1', '0x1'), 1);
    t.same(div('0x2', '0x1'), 2);
    t.same(div('0x4', '0x1'), 4);
    t.end();
  });

  t.test('n<m', (t) => {
    t.same(div('0x2', '0x4'), 0);
    t.same(div('0xFFFFFFFFFFFFFFFF', '0xFFFFFFFFFFFFFFFFF'), 0);
    t.end();
  });

  t.test('n=m', (t) => {
    t.same(div('0x2', '0x2'), 1);
    t.same(div('0xFFFFFFFFFFFFFFFF', '0xFFFFFFFFFFFFFFFF'), 1);
    t.end();
  });

  t.test('1<m<0xFFFFFFFF, 1<n<0xFFFFFFFF', (t) => {
    t.same(div('0x2', '0x2'), 1);
    t.same(div('0x4', '0x2'), 2);
    t.same(div('0x8', '0x2'), 4);

    t.same(div('0xbeef', '16'), 0xbee);
    t.same(div('0x1000', '0x10'), 0x100);
    t.same(div('0x10000000', '0x10'), 0x1000000);
    t.same(div('0xDEADBEEF', '16'), 0xdeadbee);
    t.same(div('0xDEADBEEF', '0x100'), 0xdeadbe);
    t.same(div('0xDEADBEEF', '0x10000000'), 0xd);
    t.same(div('0xFFFFFFFF', '0xf'), 0x11111111);
    t.same(div('0xFFFFFFFF', '0xffffffff'), 0x1);
    t.same(div('0xFFFFFFFF', '0xfffffff'), 0x10);

    t.end();
  });

  t.test('n>0xFFFFFFFF, 1<m<0xFFFFFFFF', (t) => {
    t.same(div('0xDEADBEEFDEADBEEF', '0x1'), '0xdeadbeefdeadbeef');
    t.same(div('0xdeadbeefdeadbeef', '0x10'), '0xdeadbeefdeadbee');
    t.same(div('0xdeadbeefdeadbeef', '0x100'), '0xdeadbeefdeadbe');
    t.same(div('0xFFFFFFFFFFFFFFFF', '0xf'), '0x1111111111111111');
    t.same(div('0xFFFFFFFFFFFFFFFF', '0xffffffff'), '0x100000001');
    t.same(div('0xFFFFFFFFFFFFFFFF', '0xfffffff'), '0x1000000100');
    t.end();
  });

  t.test('n>m>0xFFFFFFFF', (t) => {
    t.same(div('0xFFFFFFFFFFFFFFFF', '0xFFFFFFFFFFFFFFF'), 0x10);
    t.same(div('0xFFFFFFFFFFFFFFFF', '0xFFFFFFFFFFFFF'), 0x1000);

    t.same(div('0xFFFFFFFFFFFFFFFFFFFF', '0xFFFFFFFFFFFFFFFFFFF'), 0x10);
    t.same(div('0xFFFFFFFFFFFFFFFFFFFF', '0xFFFFFFFFFFFFFFFFF'), 0x1000);

    t.same(
      div('0xDEADBEEFDEADBEEF00000000', '0xDEADBEEFDEADBEEF0000'),
      0x10000,
    );

    t.end();
  });

  t.test('special case requiring two D6 steps in Algorithm D', (t) => {
    const n = 34125305527818743474129076526n;
    const m = 9580783237862390338n;
    const v = n / m;
    t.same(div(String(n), String(m)), toHex(v));

    t.end();
  });

  t.test('fuzzing', async (t) => {
    for (let i = 0; i < N; i++) {
      const n = random(M);
      const m = random(M) || 1n;
      t.same(div(String(n), String(m)), toHex(n / m));
    }
    t.end();
  });

  t.end();
});

const pow = (n, m) =>
  mpz.toHex(mpz.pow(mpz.from(String(n)), mpz.from(String(m))));

t.test('pow', (t) => {
  t.same(pow('1', '1'), '0x1');
  t.same(pow('1', '2'), '0x1');
  t.same(pow('2', '2'), '0x4');
  t.same(pow('0xdeadbeef', '1'), '0xdeadbeef');
  t.end();
});

t.test("Kunth's Test", (t) => {
  const b = 10;

  for (let i = 0; i < N; i++) {
    const m = ((Math.random(M) * 2 ** 8) | 0) + 1;
    const n = ((Math.random(M) * 2 ** 8) | 0) + m + 1;

    const tm1 = `${b - 1}`;
    const r = `${tm1.repeat(m - 1)}${b - 2}${tm1.repeat(n - m)}${'0'.repeat(
      m - 1,
    )}1`;

    const tm = mpz.sub(mpz.pow(mpz.from(String(b)), mpz.from(String(m))), mpz.from('1'));
    const tn = mpz.sub(mpz.pow(mpz.from(String(b)), mpz.from(String(n))), mpz.from('1'));

    t.same(mpz.toString(mpz.mul(tm, tn)), BigInt(r));
  }

  t.end();
});
