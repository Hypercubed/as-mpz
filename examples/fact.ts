import { MpZ } from '../assembly';

console.log(`n\tn!`);

let n = 0;
while (n <= 20) {
  console.log(`${n}\t${MpZ.from(n).fact()}`);
  ++n;
}

n = 25;
while (n <= 150) {
  console.log(`${n}\t${MpZ.from(n).fact().valueOf()}`);
  n += 25;
}
