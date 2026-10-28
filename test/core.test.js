import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  encodeGray,
  decodeGray,
  encodeGrayBinary,
  decodeGrayBinary,
} from '../src/index.js';

// A round-trip on every value from 0 to 255 catches any off-by-one in the
// XOR reduction used by decodeGray. This is the single most important property.
test('round-trip encode then decode for 0..255', () => {
  for (let i = 0; i <= 255; i++) {
    const encoded = encodeGray(i);
    const decoded = decodeGray(encoded);
    assert.equal(decoded, BigInt(i));
  }
});

test('round-trip decode then encode for 0..255', () => {
  for (let i = 0; i <= 255; i++) {
    const decoded = decodeGray(BigInt(i));
    const reencoded = encodeGray(decoded);
    assert.equal(reencoded, BigInt(i));
  }
});

// Known 4-bit Gray code table verified against the classic reflected-binary
// definition. This guards against a formula typo that might still round-trip.
test('known 4-bit gray code values', () => {
  const expected = [
    0b0000n, 0b0001n, 0b0011n, 0b0010n,
    0b0110n, 0b0111n, 0b0101n, 0b0100n,
    0b1100n, 0b1101n, 0b1111n, 0b1110n,
    0b1010n, 0b1011n, 0b1001n, 0b1000n,
  ];
  for (let i = 0; i < expected.length; i++) {
    assert.equal(encodeGray(i), expected[i]);
  }
});

test('encodeGray accepts bigint input', () => {
  assert.equal(encodeGray(0n), 0n);
  assert.equal(encodeGray(1n), 1n);
  assert.equal(encodeGray(7n), 4n);
});

test('encodeGray rejects negative numbers', () => {
  assert.throws(() => encodeGray(-1), RangeError);
  assert.throws(() => encodeGray(-1n), RangeError);
});

test('decodeGray rejects negative numbers', () => {
  assert.throws(() => decodeGray(-1), RangeError);
  assert.throws(() => decodeGray(-1n), RangeError);
});

test('encodeGray rejects non-integers', () => {
  assert.throws(() => encodeGray(3.5), RangeError);
});

test('values above 2^31 round-trip correctly', () => {
  // JavaScript bitwise XOR is 32-bit signed, so values near 2^31 are where a
  // naive `value ^ (value >> 1)` implementation would silently break.
  const values = [
    2147483648n,           // 2^31
    2147483649n,           // 2^31 + 1
    4294967295n,           // 2^32 - 1
    281474976710655n,      // 2^48 - 1
    9007199254740992n,     // 2^53
  ];
  for (const v of values) {
    assert.equal(decodeGray(encodeGray(v)), v);
  }
});

test('encodeGrayBinary produces fixed-width zero-padded strings', () => {
  assert.equal(encodeGrayBinary(0, 4), '0000');
  assert.equal(encodeGrayBinary(1, 4), '0001');
  assert.equal(encodeGrayBinary(15, 4), '1000');
});

test('encodeGrayBinary rejects values that exceed the width', () => {
  assert.throws(() => encodeGrayBinary(16, 4), RangeError);
});

test('encodeGrayBinary rejects invalid widths', () => {
  assert.throws(() => encodeGrayBinary(0, 0), RangeError);
  assert.throws(() => encodeGrayBinary(0, -1), RangeError);
  assert.throws(() => encodeGrayBinary(0, 4.5), RangeError);
});

test('decodeGrayBinary parses binary strings with leading zeros', () => {
  assert.equal(decodeGrayBinary('0000'), 0n);
  assert.equal(decodeGrayBinary('0001'), 1n);
  assert.equal(decodeGrayBinary('1000'), 15n);
});

test('decodeGrayBinary rejects invalid characters', () => {
  assert.throws(() => decodeGrayBinary(''), RangeError);
  assert.throws(() => decodeGrayBinary('2'), RangeError);
  assert.throws(() => decodeGrayBinary('0012'), RangeError);
  assert.throws(() => decodeGrayBinary('0010a'), RangeError);
});

test('binary string round-trips for 0..255 at width 8', () => {
  for (let i = 0; i <= 255; i++) {
    const bits = encodeGrayBinary(i, 8);
    assert.equal(bits.length, 8);
    const decoded = decodeGrayBinary(bits);
    assert.equal(decoded, BigInt(i));
  }
});

test('encodeGray(0) is 0 and encodeGray(1) is 1', () => {
  assert.equal(encodeGray(0), 0n);
  assert.equal(encodeGray(1), 1n);
});

test('consecutive Gray codes differ by exactly one bit', () => {
  for (let i = 0; i < 1023; i++) {
    const a = Number(encodeGray(i));
    const b = Number(encodeGray(i + 1));
    const diff = a ^ b;
    // diff must be a single bit: power of two, i.e. exactly one bit set.
    assert.ok(diff > 0 && (diff & (diff - 1)) === 0, `bit difference between ${i} and ${i + 1} is not exactly one bit`);
  }
});
