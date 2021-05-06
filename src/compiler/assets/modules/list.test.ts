import { generateBinary } from "../../../wasm";
import { ModuleBuilder } from "../../module-builder";
import { getListModuleDefinition } from "./list";

describe(getListModuleDefinition, () => {
  describe("$__list_new__", () => {
    it("should always return 0", async () => {
      const buf = new ModuleBuilder({
        name: "test",
        code: `
          (module
            (func $test (result i32)
              call $__list_new__
             )
            (export "test" (func $test))
          )
        `,
        dependencies: [getListModuleDefinition()],
      })
        .build()
        .mapValue(generateBinary)
        .unwrap();
      const { instance } = await WebAssembly.instantiate(buf, {});
      expect((instance.exports["test"] as Function)()).toBe(0);
    });
  });

  describe("$__list_is_empty__", () => {
    it("should return true when a list is empty", async () => {
      const buf = new ModuleBuilder({
        name: "test",
        code: `
          (module
            (func $test (result i32)
              call $__list_new__
              call $__list_is_empty__
             )
            (export "test" (func $test))
          )
        `,
        dependencies: [getListModuleDefinition()],
      })
        .build()
        .mapValue(generateBinary)
        .unwrap();
      const { instance } = await WebAssembly.instantiate(buf, {});
      expect((instance.exports["test"] as Function)()).toBe(1);
    });

    it("should return false when a list is not empty", async () => {
      const buf = new ModuleBuilder({
        name: "test",
        code: `
          (module
            (func $test (result i32)
              call $__list_new__
              i32.const 1
              call $__list_push__
              call $__list_is_empty__
             )
            (export "test" (func $test))
          )
        `,
        dependencies: [getListModuleDefinition()],
      })
        .build()
        .mapValue(generateBinary)
        .unwrap();
      const { instance } = await WebAssembly.instantiate(buf, {});
      expect((instance.exports["test"] as Function)()).toBe(0);
    });
  });

  describe("$__list_head__", () => {
    it("should return the head value of the list", async () => {
      const buf = new ModuleBuilder({
        name: "test",
        code: `
          (module
            (func $test (result i32)
              call $__list_new__
              i32.const 100
              call $__list_push__

              call $__list_head__
             )
            (export "test" (func $test))
          )
        `,
        dependencies: [getListModuleDefinition()],
      })
        .build()
        .mapValue(generateBinary)
        .unwrap();
      const { instance } = await WebAssembly.instantiate(buf, {});
      expect((instance.exports["test"] as Function)()).toBe(100);
    });
  });

  describe("$__list_tail__", () => {
    it("should return address of rest of the list", async () => {
      const buf = new ModuleBuilder({
        name: "test",
        code: `
          (module
            (func $test (result i32)
              call $__list_new__
              i32.const 100
              call $__list_push__

              i32.const 200
              call $__list_push__

              i32.const 300
              call $__list_push__

              call $__list_tail__
              call $__list_head__
             )
            (export "test" (func $test))
          )
        `,
        dependencies: [getListModuleDefinition()],
      })
        .build()
        .mapValue(generateBinary)
        .unwrap();
      const { instance } = await WebAssembly.instantiate(buf, {});
      expect((instance.exports["test"] as Function)()).toBe(200);
    });
  });
});
