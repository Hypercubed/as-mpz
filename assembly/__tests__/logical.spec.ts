import { MpZ } from '..';
import { assertSame } from './assertions';

describe('logical not', () => {
  it('return correct results', () => {
    assertSame(!MpZ.from(0), true);
    assertSame(!!MpZ.from(0), false);
    assertSame(!MpZ.from(1), false);
    assertSame(!MpZ.from(-1), false);

    assertSame(!!MpZ.from(1) && !!MpZ.from(1), true);
    assertSame(!!MpZ.from(1) && !!MpZ.from(0), false);
  });
});
