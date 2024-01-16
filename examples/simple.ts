import { MpZ } from '../assembly';

const a = MpZ.from(18448972);
const b = MpZ.from('7881297289452930');
const c = MpZ.from('0x583F99D51C76AB3DEAB75');

console.log(`${(a + b) * c}`);
