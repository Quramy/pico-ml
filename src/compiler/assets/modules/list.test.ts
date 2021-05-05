import { generateBinary } from "../../../wasm";
import { ModuleBuilder } from "../../module-builder";
import { getListModuleDefinition } from "./list";

describe(getListModuleDefinition, () => {
  describe("$__list__new__", () => {
    it("should always return 0", async () => {
      const buf = new ModuleBuilder({
        name: "test",
        code: `
          (module
            (func $test (result i32)
              call $__list__new__
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
              call $__list__new__
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
              call $__list__new__
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
