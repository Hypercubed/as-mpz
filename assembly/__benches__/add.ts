import { MpZ } from '..';
import { BigInt } from 'as-bigint/assembly/BigInt';

const a = '0xFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAEDFEEBDAED';
const b = '0xDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF';
const mpzA = MpZ.from(a);
const mpzB = MpZ.from(b);

const bigIntA = BigInt.from(a);
const bigIntB = BigInt.from(b);

assert(`${mpzA.add(mpzB)}` === `${bigIntA.add(bigIntB)}`);

suite('add large', () => {
  bench('MpZ#__uadd (large)', () => {
    // @ts-ignore
    blackbox(mpzA.__uadd(mpzB));
  });

  bench('MpZ#add (large)', () => {
    blackbox(mpzA.add(mpzB));
  });

  bench('BigInt#add (large)', () => {
    blackbox(bigIntA.add(bigIntB));
  });
});

// const c = 0xbeef;
// const mpzC = blackbox(MpZ.from(c));
// const bigIntC = blackbox(BigInt.from(c));

// suite('add small', () => {
//   bench('MpZ#_uaddToU32 (small)', () => {
//     // @ts-ignore
//     blackbox(mpzA._uaddToU32(c));
//   });

//   bench('MpZ#__uadd (small)', () => {
//     // @ts-ignore
//     blackbox(mpzA.__uadd(mpzC));
//   });

//   bench('MpZ#add (small)', () => {
//     blackbox(mpzA.add(mpzC));
//   });

//   bench('BigInt#add (small)', () => {
//     blackbox(bigIntA.add(bigIntC));
//   });
// });
