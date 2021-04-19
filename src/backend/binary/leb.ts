export function encodeUnsigned(value: number): Uint8Array {
  if (value < 0) {
    throw new Error("Value must not be negative.");
  }
  const buf: number[] = [];
  while (true) {
    const byte = value & 0x7f;
    value >>= 7;
    if (value === 0) {
      buf.push(byte);
      break;
    }
    buf.push(0x80 | byte);
  }
  return new Uint8Array(buf);
}

export function encodeSinged(value: number): Uint8Array {
  value |= 0;
  const buf: number[] = [];
  while (true) {
    const byte = value & 0x7f;
    value >>= 7;
    if ((value === 0 && (byte & 0x40) === 0) || (value === -1 && (byte & 0x40) !== 0)) {
      buf.push(byte);
      break;
    }
    buf.push(0x80 | byte);
  }
  return new Uint8Array(buf);
}
