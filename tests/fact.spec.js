import t from 'tap';
import { t_fact, t_factDiv } from './setup.js';

t.test('factorials', (t) => {
  t.equal(t_fact(0), 1n);
  t.equal(t_fact(10), 3628800n);
  t.equal(
    t_fact(100),
    0x1b30964ec395dc24069528d54bbda40d16e966ef9a70eb21b5b2943a321cdf10391745570cca9420c6ecb3b72ed2ee8b02ea2735c61a000000000000000000000000n,
  );

  t.equal(t_factDiv(0, 0), 1n);
  t.equal(t_factDiv(100, 99), 100n);
  t.equal(t_factDiv(1000, 999), 1000n);

  t.end();
});

t.end();
