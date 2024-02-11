import { MpZ } from '../assembly';

let fn = MpZ.from(3); // f0
let n: u64 = 0;

function nextFermatNumber(): void {
  n += 1;
  fn = fn.sub(1).pow(2).add(1);
}

console.log(`F${n} = ${fn}`);

while (n < 8) {
  nextFermatNumber();
  console.log(`F${n} = ${fn}`);
}

while (true) {
  nextFermatNumber();
  const s = fn.toDecimal();
  console.log(
    `F${n} = ${s.slice(0, 10)}...${s.slice(-10)} (${s.length} digits)`
  );
}
