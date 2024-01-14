export function toHex(a) {
  if (typeof a !== 'string') a = a.toString(16);

  if (a.startsWith('-')) {
    return '-0x' + a.slice(1);
  }
  return '0x' + a;
}

export function randomUint32() {
  return (Math.random() * 2 ** 32) >>> 0;
}

export function randomSigned(limbs) {
  const sign = Math.random() > 0.5 ? 1 : -1;
  const n = new Uint32Array(limbs).reduce((a, _, k) => {
    const p = 2n ** BigInt(k * 32);
    const l = BigInt(randomUint32());
    return a + l * p;
  }, 0n);
  return n * BigInt(sign);
}

export function random(M = 2 ** 6) {
  const r = Math.random();
  if (r < 0.3) return randomSigned(1); // 30% chance of 1 limb
  if (r < 0.6) return randomSigned(2); // 30% chance of 2 limbs
  const limbs = Math.floor(Math.random() * (M - 2)) + 2; // 40% chance of 3-64 limbs
  return randomSigned(limbs);
}
