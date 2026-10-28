# gray-code-encoder

Convert between binary and Gray code (reflected binary) representations for arbitrary-width unsigned integers. Exports `encodeGray`, `decodeGray`, `encodeGrayBinary`, and `decodeGrayBinary`.

```js
import { encodeGray, decodeGray, encodeGrayBinary, decodeGrayBinary } from 'gray-code-encoder';

encodeGray(7);              // 4n
decodeGray(4n);             // 7n
encodeGrayBinary(7, 4);     // "0100"
decodeGrayBinary('0100');   // 7n
```

All four functions accept either a `number` or a `bigint` input and return a `bigint` (or a string for the binary variants). The library exists because JavaScript's bitwise XOR is a 32-bit signed operation, which silently corrupts Gray code conversions for values at or above 2^31. Using `BigInt` arithmetic throughout avoids that trap and lets you encode positions from small rotary encoders up to 48-bit or wider values without a second thought.

The edge you will hit: the `number` type cannot represent all integers above 2^53. If you genuinely need widths beyond 53 bits, pass a `bigint` literal (e.g. `9007199254740993n`) rather than a `number`. Passing a `number` above 2^53 that has lost precision will produce the Gray code of the rounded value, which is correct for what you passed but not for what you may have intended.
