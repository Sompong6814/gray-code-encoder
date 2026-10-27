/**
 * Core Gray code conversion logic for unsigned integers.
 *
 * All conversions operate on unsigned integer values. JavaScript's bitwise
 * operators are 32-bit signed, which makes them unreliable for values above
 * 2^31. We therefore use multiplication, division, and BigInt arithmetic
 * exclusively so the library works for arbitrary widths.
 */

/**
 * Encode an unsigned integer value to its Gray code (reflected binary)
 * equivalent using the standard formula: gray = value ^ (value >> 1).
 *
 * We use BigInt internally because XOR on numbers is a signed 32-bit
 * operation in JavaScript and silently breaks for inputs >= 2^31.
 *
 * @param {number|bigint} value - non-negative integer to encode.
 * @returns {bigint} the Gray code of `value`.
 * @throws {RangeError} if `value` is negative or not an integer.
 */
export function encodeGray(value) {
  const n = typeof value === 'bigint' ? value : BigInt(value);
  if (n < 0n) {
    throw new RangeError('value must be non-negative');
  }
  return n ^ (n >> 1n);
}

/**
 * Decode a Gray code value back to the original unsigned integer.
 *
 * Decoding uses the standard prefix-XOR reduction. For a width of w bits,
 * this requires w-1 XOR operations. We determine the width from the
 * position of the highest set bit in the input rather than asking the
 * caller for it, so the caller does not need to track width separately.
 *
 * @param {number|bigint} gray - non-negative Gray code value.
 * @returns {bigint} the decoded unsigned integer.
 * @throws {RangeError} if `gray` is negative or not an integer.
 */
export function decodeGray(gray) {
  const g = typeof gray === 'bigint' ? gray : BigInt(gray);
  if (g < 0n) {
    throw new RangeError('gray must be non-negative');
  }
  let result = g;
  let shift = g >> 1n;
  while (shift > 0n) {
    result ^= shift;
    shift >>= 1n;
  }
  return result;
}

/**
 * Encode a value as a zero-padded Gray code binary string of the given width.
 *
 * The width determines the total number of bits in the output string, which
 * is useful when you need a fixed-width representation (e.g., for rotary
 * encoder position reporting).
 *
 * @param {number|bigint} value - non-negative integer to encode.
 * @param {number} width - number of bits in the output string.
 * @returns {string} zero-padded binary string of length `width`.
 * @throws {RangeError} if `value` is negative, `width` is not a positive
 *   integer, or the encoded value exceeds `2^width - 1`.
 */
export function encodeGrayBinary(value, width) {
  if (!Number.isInteger(width) || width <= 0) {
    throw new RangeError('width must be a positive integer');
  }
  const gray = encodeGray(value);
  const maxGray = (1n << BigInt(width)) - 1n;
  if (gray > maxGray) {
    throw new RangeError(
      `encoded value requires more than ${width} bit${width === 1 ? '' : 's'}`
    );
  }
  let bits = gray.toString(2);
  while (bits.length < width) {
    bits = '0' + bits;
  }
  return bits;
}

/**
 * Decode a binary string (Gray code) back to the original unsigned integer.
 *
 * The string must contain only `0` and `1` characters and represent a
 * non-negative value. Leading zeros are accepted.
 *
 * @param {string} bits - binary string representing a Gray code.
 * @returns {bigint} the decoded unsigned integer.
 * @throws {RangeError} if `bits` is empty or contains characters other than `0` and `1`.
 */
export function decodeGrayBinary(bits) {
  if (typeof bits !== 'string' || bits.length === 0) {
    throw new RangeError('bits must be a non-empty string');
  }
  if (!/^[01]+$/.test(bits)) {
    throw new RangeError('bits must contain only 0 and 1 characters');
  }
  const gray = BigInt('0b' + bits);
  return decodeGray(gray);
}
