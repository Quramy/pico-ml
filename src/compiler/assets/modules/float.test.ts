import { generateBinaryWithDefaultOptions as generateBinary } from "../../../wasm";
import { ModuleBuilder } from "../../module-builder";
import { storeFloatValueInstr, getFloatValueInstr, getFloatModuleDefinition, reduceInstructions } from "./float";

describe(getFloatModuleDefinition, () => {
  it("should store floating point value", async () => {
    const buf = new ModuleBuilder({
      name: "test",
      code: `
        (module
          (func $test (result f64)
            f64.const 3.14
            call $__float_new__ 
            call $__float_get__
          )
          (export "test" (func $test))
        )
      `,
      dependencies: [getFloatModuleDefinition()],
    })
      .build()
      .mapValue(generateBinary)
      .unwrap();
    const { instance } = await WebAssembly.instantiate(buf, {});
    expect((instance.exports["test"] as Function)()).toBe(3.14);
  });
});

describe(reduceInstructions, () => {
  it("should reduce redundant instructions", () => {
    expect(reduceInstructions([...storeFloatValueInstr(), ...getFloatValueInstr()])).toEqual([]);
  });
});
