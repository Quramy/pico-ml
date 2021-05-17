import { generateBinaryWithDefaultOptions as generateBinary } from "../../../wasm";
import { ModuleBuilder } from "../../module-builder";

import { getAllocatorModuleDefinition } from "./alloc";

describe(getAllocatorModuleDefinition, () => {
  it("should allocate liner memory and return the allocated address", async () => {
    const buf = new ModuleBuilder({
      name: "test",
      code: `
        (module
          (func $test (param $size i32) (result i32)
            local.get $size
            call $__malloc__
          )
          (export "test" (func $test))
        )
      `,
      dependencies: [getAllocatorModuleDefinition()],
    })
      .build()
      .mapValue(generateBinary)
      .unwrap();
    const { instance } = await WebAssembly.instantiate(buf, {});
    expect((instance.exports["test"] as Function)(10)).toBe(4);
    expect((instance.exports["test"] as Function)(5)).toBe(14);
    expect((instance.exports["test"] as Function)(10)).toBe(19);
  });
});
