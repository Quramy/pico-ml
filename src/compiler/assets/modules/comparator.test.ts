import { generateBinaryWithDefaultOptions as generateBinary } from "../../../wasm";
import { ModuleBuilder } from "../../module-builder";
import { getComparatorModuleDefinition } from "./comparator";
import { fromNumber2IntBase, toBoolean } from "../../js-bindings";

describe(getComparatorModuleDefinition, () => {
  describe("with integer operand", () => {
    it("should calc lt correctly", async () => {
      expect(await compInt(1, "lt", 1)).toBe(false);
      expect(await compInt(1, "lt", 0)).toBe(false);
      expect(await compInt(1, "lt", 2)).toBe(true);
    });
  });

  describe("boolean comparison", () => {
    it("should calc lt correctly", async () => {
      expect(await compBool(false, "lt", false)).toBe(false);
      expect(await compBool(true, "lt", true)).toBe(false);
      expect(await compBool(true, "lt", false)).toBe(false);
      expect(await compBool(false, "lt", true)).toBe(true);
    });
  });

  describe("with floating-number comparison", () => {
    it("should calc lt correctly", async () => {
      expect(await compFloat(0.0, "lt", 0.0)).toBe(false);
      expect(await compFloat(1.0, "lt", 0.0)).toBe(false);
      expect(await compFloat(0.0, "lt", 1.0)).toBe(true);
    });
  });

  describe("with list comparison", () => {
    test("1::[] < [] = false", async () => {
      expect(
        await compWithModuleCode(
          `
            (module
              (func $test (result i32)
                ;; L1
                call $__list_new__
                i32.const 1
                call $__list_push__

                ;; L2
                call $__list_new__

                call $__comparator_poly_lt__
              )
              (export "test" (func $test))
            )
          `,
        ),
      ).toBe(false);
    });

    test("1::[] < 1::[] = false", async () => {
      expect(
        await compWithModuleCode(
          `
            (module
              (func $test (result i32)
                ;; L1
                call $__list_new__
                i32.const 1
                call $__list_push__

                ;; L2
                call $__list_new__
                i32.const 1
                call $__list_push__

                call $__comparator_poly_lt__
              )
              (export "test" (func $test))
            )
          `,
        ),
      ).toBe(false);
    });

    test("[] < 1::[] = true", async () => {
      expect(
        await compWithModuleCode(
          `
            (module
              (func $test (result i32)
                ;; L1
                call $__list_new__

                ;; L2
                call $__list_new__
                i32.const 1
                call $__list_push__

                call $__comparator_poly_lt__
              )
              (export "test" (func $test))
            )
          `,
        ),
      ).toBe(true);
    });

    test("1::2::[] < 2::[] = true", async () => {
      expect(
        await compWithModuleCode(
          `
            (module
              (func $test (result i32)
                ;; L1
                call $__list_new__
                i32.const 2
                call $__list_push__
                i32.const 1
                call $__list_push__

                ;; L2
                call $__list_new__
                i32.const 2
                call $__list_push__

                call $__comparator_poly_lt__
              )
              (export "test" (func $test))
            )
          `,
        ),
      ).toBe(true);
    });
  });
});

async function compInt(left: number, op: "lt" | "le" | "gt" | "ge", right: number) {
  const buf = new ModuleBuilder({
    name: "test",
    code: `
        (module
          (func $test (param $a i32) (param $b i32) (result i32)
            local.get $a
            local.get $b
            call $__comparator_poly_${op}__
          )
          (export "test" (func $test))
        )
      `,
    dependencies: [getComparatorModuleDefinition({ withFloat: true, withList: false })],
  })
    .build()
    .mapValue(generateBinary)
    .unwrap();
  const { instance } = await WebAssembly.instantiate(buf, {});
  return toBoolean(
    instance,
    (instance.exports["test"] as Function)(fromNumber2IntBase(left), fromNumber2IntBase(right)),
  );
}

async function compBool(left: boolean, op: "lt" | "le" | "gt" | "ge", right: boolean) {
  const buf = new ModuleBuilder({
    name: "test",
    code: `
        (module
          (func $test (param $a i32) (param $b i32) (result i32)
            local.get $a
            local.get $b
            call $__comparator_poly_${op}__
          )
          (export "test" (func $test))
        )
      `,
    dependencies: [getComparatorModuleDefinition({ withFloat: true, withList: false })],
  })
    .build()
    .mapValue(generateBinary)
    .unwrap();
  const { instance } = await WebAssembly.instantiate(buf, {});
  return toBoolean(instance, (instance.exports["test"] as Function)(left ? 1 : 0, right ? 1 : 0));
}

async function compFloat(left: number, op: "lt" | "le" | "gt" | "ge", right: number) {
  const buf = new ModuleBuilder({
    name: "test",
    code: `
        (module
          (func $test (param $a f64) (param $b f64) (result i32)
            local.get $a
            call $__float_new__
            local.get $b
            call $__float_new__
            call $__comparator_poly_${op}__
          )
          (export "test" (func $test))
        )
      `,
    dependencies: [getComparatorModuleDefinition({ withFloat: true, withList: false })],
  })
    .build()
    .mapValue(generateBinary)
    .unwrap();
  const { instance } = await WebAssembly.instantiate(buf, {});
  return toBoolean(instance, (instance.exports["test"] as Function)(left ? 1 : 0, right ? 1 : 0));
}

async function compWithModuleCode(code: string) {
  const buf = new ModuleBuilder({
    name: "test",
    code,
    dependencies: [getComparatorModuleDefinition({ withFloat: true, withList: false })],
  })
    .build()
    .mapValue(generateBinary)
    .unwrap();
  const { instance } = await WebAssembly.instantiate(buf, {});
  return toBoolean(instance, (instance.exports["test"] as Function)());
}
