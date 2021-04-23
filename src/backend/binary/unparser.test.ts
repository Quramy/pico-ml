import { parse } from "../wat/parser";
import { convertModule } from "../converter";
import { unparse } from "./unparser";

describe(unparse, () => {
  it("should be generate WASM binary from WAT sourcecode", async () => {
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
});
