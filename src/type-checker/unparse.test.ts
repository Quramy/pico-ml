import { createTypePrinter } from "./unparse";
import { TypeValue } from "./types";
import { int, list, param, func, bool } from "./testing/helpers";

const print = (type: TypeValue) => createTypePrinter()(type);

describe(createTypePrinter, () => {
  test("unparse", () => {
    expect(print(int())).toBe("int");
    expect(print(param(0))).toBe("'a");
    expect(print(param(25))).toBe("'z");
    expect(print(param(26))).toBe("'aa");
    expect(print(list(int()))).toBe("int list");
    expect(print(func(bool(), int()))).toBe("bool -> int");
    expect(print(func(int(), list(int())))).toBe("int -> int list");
    expect(print(list(func(int(), int())))).toBe("(int -> int) list");
  });
});
