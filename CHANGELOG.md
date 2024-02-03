CHANGELOG
=========

## HEAD (Unreleased)
* *Feature*: Implement `MpZ.asIntN` and `MpZ.asUintN`.
* *Improvement*: Improve `#mod` performance.
* *Bugfix*: Make `#not` public

---

## 2.1.0 (2024-01-28)
* *Feature*: Implement `#inc` and `#dec`.
* *Improvement*: Improve `#add` performance.
* *bugfix*: Fix `++` and `--` operators for negative numbers.

## 2.0.0 (2024-01-27)
* *Breaking*: Renamed `#cmp` to `#compareTo`.
* *Breaking*: Renamed `#neg` to `#negate`.
* *Feature*: Implement `#sign`.
* *Feature*: Implement bitshift operators (`<<`, `>>`) and methods (`#shiftLeft`, `#shiftRight`) as "2-complement" (i.e. arithmetic) shifts.
* *Feature*: Implement `#mul_pow2` and `#div_pow2`.
* *Feature*: Implement bitwise methods (`#and`, `#or`, `#xor`, `#not`) and operators (`&`, `|`, `^`, `~`) as "2-complement" like.
* *Bugfix*: Fix `toString` for negitive numbers when radix not equal to 10 or 16.

