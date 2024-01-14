import t from 'tap';
import { t_shl } from './setup.js';

t.test('shl', (t) => {
  t.equal(t_shl(1, 1), 2n);
  t.equal(t_shl('0xdeadbeef', 1), 0x1bd5b7dden);
  t.equal(t_shl('0xdeadbeef', 8), 0xdeadbeef00n);
  t.equal(t_shl('0xdeadbeef', 32), 0xdeadbeef00000000n);
  t.equal(t_shl('0xdeadbeef', 64), 0xdeadbeef0000000000000000n);
  t.end();
});

t.end();
