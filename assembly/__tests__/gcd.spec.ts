import { MpZ } from '..';
import { assertSame } from './assertions';

describe('gcd', () => {
  it('return correct results', () => {
    assertSame(MpZ.from(0).gcd(0), 0);
    assertSame(MpZ.from(0).gcd(10), 10);
    assertSame(MpZ.from(0).gcd(-10), 10);
    assertSame(MpZ.from(9).gcd(6), 3);
    assertSame(MpZ.from(6).gcd(9), 3);
    assertSame(MpZ.from(-6).gcd(9), 3);
    assertSame(MpZ.from(8).gcd(45), 1);
    assertSame(MpZ.from(48).gcd(18), 6);
    assertSame(MpZ.from(40902).gcd(24140), 34);
    assertSame(MpZ.from(1_234_567).gcd(9_876_543), 1);
    assertSame(MpZ.from(1234567890).gcd(987654321), 9);
    assertSame(MpZ.from('1234567890987654321').gcd('9876543211234567890'), 9);
  });
});

describe('lcm', () => {
  it('return correct results', () => {
    assertSame(MpZ.from(0).lcm(0), 0);
    assertSame(MpZ.from(0).lcm(10), 0);
    assertSame(MpZ.from(0).lcm(-10), 0);
    assertSame(MpZ.from(9).lcm(6), 18);
    assertSame(MpZ.from(6).lcm(9), 18);
    assertSame(MpZ.from(-6).lcm(9), 18);
    assertSame(MpZ.from(8).lcm(45), 360);
    assertSame(MpZ.from(48).lcm(18), 144);
    assertSame(MpZ.from(40902).lcm(24140), 29040420);
    assertSame(MpZ.from(1_234_567).lcm(9_876_543), 12193254061881);
    assertSame(MpZ.from(1234567890).lcm(987654321), '135480701236261410');
    assertSame(
      MpZ.from('1234567890987654321').lcm('9876543211234567890'),
      '1354807013615810594904232091236261410'
    );
  });
});
