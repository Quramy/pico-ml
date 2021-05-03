import { generateBinary } from "../../../wasm";
import { ModuleBuilder } from "../../moduel-builder";

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
    expect((instance.exports["test"] as Function)(10)).toBe(0);
    expect((instance.exports["test"] as Function)(5)).toBe(10);
    expect((instance.exports["test"] as Function)(10)).toBe(15);
  });
});
