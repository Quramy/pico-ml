import { encodeUnsigned, encodeSinged } from "./leb";

describe(encodeUnsigned, () => {
  test(encodeUnsigned.name, () => {
    expect([...encodeUnsigned(0)]).toEqual([0x00]);
    expect([...encodeUnsigned(1)]).toEqual([0x01]);
    expect([...encodeUnsigned(0x7f)]).toEqual([0x7f]);
    expect([...encodeUnsigned(0x80)]).toEqual([0x80, 0x01]);
    expect([...encodeUnsigned(0x81)]).toEqual([0x81, 0x01]);
    expect([...encodeUnsigned(624485)]).toEqual([0xe5, 0x8e, 0x26]);
  });
});

describe(encodeSinged, () => {
  test(encodeSinged.name, () => {
    expect([...encodeSinged(0)]).toEqual([0x00]);
    expect([...encodeSinged(1)]).toEqual([0x01]);
    expect([...encodeSinged(-1)]).toEqual([0x7f]);
    expect([...encodeSinged(0x7f)]).toEqual([0xff, 0x00]);
    expect([...encodeSinged(-0x7f)]).toEqual([0x81, 0x7f]);
    expect([...encodeSinged(-123456)]).toEqual([0xc0, 0xbb, 0x78]);
  });
});
