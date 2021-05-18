export function encodeString(str: string): Uint8Array {
  const n = str.length;
  let idx = -1;
  let byteLength = 0x200;
  let bytes = new Uint8Array(byteLength);
  let _bytes = bytes;

  for (let i = 0; i < n; ++i) {
    const c = str.charCodeAt(i);
    if (c <= 0x7f) {
      bytes[++idx] = c;
    } else if (c <= 0x7ff) {
      bytes[++idx] = 0xc0 | (c >>> 6);
      bytes[++idx] = 0x80 | (c & 0x3f);
    } else if (c <= 0xffff) {
      bytes[++idx] = 0xe0 | (c >>> 12);
      bytes[++idx] = 0x80 | ((c >>> 6) & 0x3f);
      bytes[++idx] = 0x80 | (c & 0x3f);
    } else {
      bytes[++idx] = 0xf0 | (c >>> 18);
      bytes[++idx] = 0x80 | ((c >>> 12) & 0x3f);
      bytes[++idx] = 0x80 | ((c >>> 6) & 0x3f);
      bytes[++idx] = 0x80 | (c & 0x3f);
    }
    if (byteLength - idx <= 4) {
      _bytes = bytes;
      byteLength <<= 1;
      bytes = new Uint8Array(byteLength);
      bytes.set(_bytes);
    }
  }
  return bytes.subarray(0, ++idx);
}
