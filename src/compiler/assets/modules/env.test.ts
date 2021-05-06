import { generateBinary } from "../../../wasm";
import { ModuleBuilder } from "../../module-builder";

import { getEnvModuleDefinition } from "./env";

describe(getEnvModuleDefinition, () => {
  describe("$__env_new__", () => {
    it("should store value to a new environment and return it's address", async () => {
      const buf = new ModuleBuilder({
        name: "test",
        code: `
          (module
            (func $test (result i32)
              i32.const 0
              i32.const 15
              call $__env_new__
              i32.const 100
              call $__env_new__
             )
            (export "test" (func $test))
            (export "mem" (memory $__alloc_mem__))
          )
        `,
        dependencies: [getEnvModuleDefinition()],
      })
        .build()
        .mapValue(generateBinary)
        .unwrap();
      const { instance } = await WebAssembly.instantiate(buf, {});
      (instance.exports["test"] as Function)();
      const mem = instance.exports["mem"] as WebAssembly.Memory;
      const arr = [...new Int32Array(mem.buffer)].slice(1, 5);
      expect(arr).toEqual([0, 15, 4, 100]);
    });
  });

  describe("$__env_get__", () => {
    it("should return the value stored in pointed env", async () => {
      const buf = new ModuleBuilder({
        name: "test",
        code: `
          (module
            (global $current_env (mut i32) i32.const 0)
            (func $set
              i32.const 0
              i32.const 10
              call $__env_new__
              i32.const 20
              call $__env_new__
              i32.const 30
              call $__env_new__
              global.set $current_env
            )
            (func $get (param $idx i32) (result i32)
              global.get $current_env
              local.get $idx
              call $__env_get__
            )
            (export "set" (func $set))
            (export "get" (func $get))
          )
        `,
        dependencies: [getEnvModuleDefinition()],
      })
        .build()
        .mapValue(generateBinary)
        .unwrap();
      const { instance } = await WebAssembly.instantiate(buf, {});
      (instance.exports["set"] as Function)();
      expect((instance.exports["get"] as Function)(0)).toBe(30);
      expect((instance.exports["get"] as Function)(1)).toBe(20);
      expect((instance.exports["get"] as Function)(2)).toBe(10);
    });
  });

  describe("$__env_parent__", () => {
    it("should return parent env address", async () => {
      const buf = new ModuleBuilder({
        name: "test",
        code: `
          (module
            (func $test (result i32)
              i32.const 0
              i32.const 10
              call $__env_new__
              i32.const 20
              call $__env_new__
              i32.const 30
              call $__env_new__
              call $__env_parent__
              call $__env_parent__
            )
            (export "test" (func $test))
          )
        `,
        dependencies: [getEnvModuleDefinition()],
      })
        .build()
        .mapValue(generateBinary)
        .unwrap();
      const { instance } = await WebAssembly.instantiate(buf, {});
      expect((instance.exports["test"] as Function)()).toBe(4);
    });
  });
});
