import { createTypePrinter } from "./unparse";
import { TypeValue } from "./types";
import { int, list, param, func, bool } from "./testing/helpers";

describe(createTypePrinter, () => {
  describe("without option", () => {
    const print = (type: TypeValue) => createTypePrinter()(type);
    test("unparse", () => {
      expect(print(int())).toBe("int");
      expect(print(param(0))).toBe("'a");
      expect(print(func(param(0), param(25)))).toBe("'a -> 'z");
      expect(print(func(param(0), param(26)))).toBe("'a -> 'aa");
      expect(print(func(bool(), int()))).toBe("bool -> int");
      expect(print(func(int(), func(int(), int())))).toBe("int -> int -> int");
      expect(print(func(func(int(), int()), int()))).toBe("(int -> int) -> int");
      expect(print(list(int()))).toBe("int list");
      expect(print(list(list(int())))).toBe("int list list");
      expect(print(func(int(), list(int())))).toBe("int -> int list");
      expect(print(list(func(int(), int())))).toBe("(int -> int) list");
    });
  });

  describe("remap", () => {
    const print = (type: TypeValue) =>
      createTypePrinter({
        remapWithSubstitutions: [
          { from: param(0), to: int() },
          { from: param(1), to: int() },
          { from: param(3), to: int() },
        ],
      })(type);
    expect(print(func(param(2), param(4)))).toBe("'a -> 'b");
  });
});
