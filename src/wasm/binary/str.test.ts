import { encodeString } from "./str";

describe(encodeString, () => {
  test(encodeString.name, () => {
    expect(Buffer.from(encodeString("hoge")).toString()).toBe("hoge");
    expect(Buffer.from(encodeString("å")).toString()).toBe("å");
    expect(Buffer.from(encodeString("簡")).toString()).toBe("簡");
  });
});
