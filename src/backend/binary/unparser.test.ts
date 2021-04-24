import { parse } from "../wat/parser";
import { convertModule } from "../converter";
import { unparse } from "./unparser";

describe(unparse, () => {
  describe("unparse result should work as WebAssembly buffered source", () => {
    test("Add function example", async () => {
      const source = `
        (module
          (memory 1)
          (func $add (param $a i32) (param $b i32) (result i32)
            local.get $a
            local.get $b
            i32.add
          )
          (export "main" (func $add))
        )
      `;
      const buf = parse(source).mapValue(convertModule).map(unparse).unwrap();
      const { instance } = await WebAssembly.instantiate(buf, {});
      expect((instance.exports["main"] as Function)(1, 2)).toBe(3);
    });

    test("If instruction example", async () => {
      const source = `
        (module
          (memory 1)
          (func $main (param $x i32) (result i32)
            local.get $x
            if $l1 (result i32)
              i32.const 0
            else
              i32.const 1
            end
          )
          (export "main" (func $main))
        )
      `;
      const buf = parse(source).mapValue(convertModule).map(unparse).unwrap();
      const { instance } = await WebAssembly.instantiate(buf, {});
      expect(instance).toBeTruthy();
      expect((instance.exports["main"] as Function)(1)).toBe(0);
      expect((instance.exports["main"] as Function)(0)).toBe(1);
    });

    test("Add function example", async () => {
      const source = `
        (module
          (memory 1)
          (func $add (param $a i32) (param $b i32) (result i32)
            local.get $a
            local.get $b
            i32.add
          )
          (func $twice (param $x i32) (result i32)
            local.get $x
            local.get $x
            call $add
          )
          (export "main" (func $twice))
        )
      `;
      const buf = parse(source).mapValue(convertModule).map(unparse).unwrap();
      const { instance } = await WebAssembly.instantiate(buf, {});
      expect((instance.exports["main"] as Function)(2)).toBe(4);
    });
  });
});
