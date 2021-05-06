import { generateBinary } from "../../../wasm";
import { ModuleBuilder } from "../../module-builder";
import { getTupleModuleDefinition } from "./tuple";

describe(getTupleModuleDefinition, () => {
  describe("$__tuple2_new__", () => {
    it("should store pair of values and return it's address", async () => {
      const buf = new ModuleBuilder({
        name: "test",
        code: `
          (module
            (func $set (result i32)
              i32.const 100
              i32.const 200
              call $__tuple_new__
            )
            (func $get_first (param $addr i32) (result i32)
              local.get $addr
              call $__tuple_get_v0__
            )
            (func $get_second (param $addr i32) (result i32)
              local.get $addr
              call $__tuple_get_v1__
            )
            (export "set" (func $set))
            (export "getFirst" (func $get_first))
            (export "getSecond" (func $get_second))
          )
        `,
        dependencies: [getTupleModuleDefinition()],
      })
        .build()
        .mapValue(generateBinary)
        .unwrap();
      const { instance } = await WebAssembly.instantiate(buf, {});
      const addr = (instance.exports["set"] as Function)() as number;
      expect((instance.exports["getFirst"] as Function)(addr)).toBe(100);
      expect((instance.exports["getSecond"] as Function)(addr)).toBe(200);
    });
  });
});
