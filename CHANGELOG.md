# CHANGELOG

## HEAD (Unreleased)

- Breaking: Renamed `#cmp` to `#compareTo`.
- Breaking: Renamed `#neg` to `#negate`.
- Feature: Implement `#sign`.
- Feature: Implement bitshift operators (`<<`, `>>`) and methods (`#shiftLeft`, `#shiftRight`) as "2-complement" (i.e. arithmetic) shifts.
- Feature: Implement `#mul_pow2` and `#div_pow2`.
- Feature: Implement bitwise methods (`#and`, `#or`, `#xor`, `#not`) and operators (`&`, `|`, `^`, `~`) as "2-complement" like.
- Bugfix: Fix `toString` for negitive numbers when radix not equal to 10 or 16.

---