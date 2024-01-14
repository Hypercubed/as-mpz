import t from 'tap';
import { t_rem, t_mod, random } from './setup.js';

const N = 500; // number of random iterations
const M = 2 ** 8; // max number of limbs

t.test('rem', (t) => {
  t.equal(t_rem('10000', '7'), 4n);
  t.equal(t_rem('-10000', '7'), -4n);
  t.equal(t_rem('10000', '-7'), 4n);
  t.equal(t_rem('-10000', '-7'), -4n);

  t.test('fuzzing', async (t) => {
    for (let i = 0; i < N; i++) {
      const n = random(M);
      const m = random(M) || 1n;
      t.equal(t_rem(n, m), n % m);
    }
    t.end();
  });

  t.end();
});

t.test('modulo', (t) => {
  t.equal(t_mod('10000', '7'), 4n);
  t.equal(t_mod('-10000', '7'), 3n);
  t.equal(t_mod('10000', '-7'), -3n);
  t.equal(t_mod('-10000', '-7'), -4n);

  t.end();
});
