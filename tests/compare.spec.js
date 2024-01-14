import t from 'tap';
import { random, t_cmp } from './setup.js';

const N = 100; // number of random iterations
const M = 2 ** 6; // max number of limbs

t.test('cmp', async (t) => {
  t.test('n>0, m>0', (t) => {
    t.equal(t_cmp(0, 0), 0);
    t.equal(t_cmp(3, 1), 1);
    t.equal(t_cmp(1, 3), -1);

    t.equal(t_cmp(3, 3), 0);
    t.equal(t_cmp(3, 5), -1);
    t.equal(t_cmp(5, 3), 1);

    t.equal(t_cmp('0xdead0000', '0x0000beef'), 1);
    t.equal(t_cmp('0x0000beef', '0xdead0000'), -1);
    t.end();
  });

  t.test('n<0, m<0', (t) => {
    t.equal(t_cmp(-3, 1), -1);
    t.equal(t_cmp(-1, 3), -1);

    t.equal(t_cmp(-3, -3), 0);
    t.equal(t_cmp(-3, -5), 1);
    t.equal(t_cmp(-5, -3), -1);

    t.equal(t_cmp('-0xdead0000', '-0x0000beef'), -1);
    t.equal(t_cmp('-0x0000beef', '-0xdead0000'), 1);

    t.end();
  });

  t.test('n>0, m<0', (t) => {
    t.equal(t_cmp(3, -1), 1);
    t.equal(t_cmp(1, -3), 1);

    t.equal(t_cmp(3, -3), 1);
    t.equal(t_cmp(3, -5), 1);
    t.equal(t_cmp(5, -3), 1);

    t.equal(t_cmp('0xdead0000', '-0x0000beef'), 1);
    t.equal(t_cmp('0x0000beef', '-0xdead0000'), 1);

    t.end();
  });

  t.test('n<0, m>0', (t) => {
    t.equal(t_cmp(-3, 1), -1);
    t.equal(t_cmp(-1, 3), -1);

    t.equal(t_cmp(-3, 3), -1);
    t.equal(t_cmp(-3, 5), -1);
    t.equal(t_cmp(-5, 3), -1);

    t.equal(t_cmp('-0xdead0000', '0x0000beef'), -1);
    t.equal(t_cmp('-0x0000beef', '0xdead0000'), -1);

    t.end();
  });

  t.test('fuzzing', async (t) => {
    for (let i = 0; i < N; i++) {
      const n = random(M);
      const m = random(M);
      t.equal(t_cmp(n, m), n > m ? 1 : n < m ? -1 : 0);
    }
    t.end();
  });
  t.end();
});

t.end();
