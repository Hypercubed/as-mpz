import { MpZ } from '../assembly';

function fact(n: u32): MpZ {
  let a = MpZ.from(1);
  for (let i: u32 = 1; i <= n; ++i) {
    a = MpZ.from(i).mul(a);
  }
  return a;
}

console.log(`n\tn!`);

let n = 0;
while (n <= 20) {
  console.log(`${n}\t${fact(n)}`);
  ++n;
}

n = 25;
while (n <= 150) {
  console.log(`${n}\t${fact(n).toValue()}`);
  n += 25;
}
