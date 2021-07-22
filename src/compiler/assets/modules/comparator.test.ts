import { generateBinaryWithDefaultOptions as generateBinary } from "../../../wasm";
import { ModuleBuilder } from "../../module-builder";
import { getComparatorModuleDefinition, ComparisonOperators } from "./comparator";
import { fromNumber2IntBase, toBoolean } from "../../js-bindings";

describe(getComparatorModuleDefinition, () => {
  describe("without float nor list", () => {
    it("should calc lt correctly", async () => {
      expect(await compInt(1, "lt", 1, true)).toBe(false);
      expect(await compInt(1, "lt", 0, true)).toBe(false);
      expect(await compInt(1, "lt", 2, true)).toBe(true);
    });

    it("should calc le correctly", async () => {
      expect(await compInt(1, "le", 1, true)).toBe(true);
      expect(await compInt(1, "le", 0, true)).toBe(false);
      expect(await compInt(1, "le", 2, true)).toBe(true);
    });

    it("should calc gt correctly", async () => {
      expect(await compInt(1, "gt", 1, true)).toBe(false);
      expect(await compInt(1, "gt", 0, true)).toBe(true);
      expect(await compInt(1, "gt", 2, true)).toBe(false);
    });

    it("should calc ge correctly", async () => {
      expect(await compInt(1, "ge", 1, true)).toBe(true);
      expect(await compInt(1, "ge", 0, true)).toBe(true);
      expect(await compInt(1, "ge", 2, true)).toBe(false);
    });

    it("should calc eq correctly", async () => {
      expect(await compInt(1, "eq", 1, true)).toBe(true);
      expect(await compInt(1, "eq", 0, true)).toBe(false);
      expect(await compInt(1, "eq", 2, true)).toBe(false);
    });

    it("should calc ne correctly", async () => {
      expect(await compInt(1, "ne", 1, true)).toBe(false);
      expect(await compInt(1, "ne", 0, true)).toBe(true);
      expect(await compInt(1, "ne", 2, true)).toBe(true);
    });
  });

  describe("with integer operand", () => {
    it("should calc lt correctly", async () => {
      expect(await compInt(1, "lt", 1)).toBe(false);
      expect(await compInt(1, "lt", 0)).toBe(false);
      expect(await compInt(1, "lt", 2)).toBe(true);
    });

    it("should calc le correctly", async () => {
      expect(await compInt(1, "le", 1)).toBe(true);
      expect(await compInt(1, "le", 0)).toBe(false);
      expect(await compInt(1, "le", 2)).toBe(true);
    });

    it("should calc gt correctly", async () => {
      expect(await compInt(1, "gt", 1)).toBe(false);
      expect(await compInt(1, "gt", 0)).toBe(true);
      expect(await compInt(1, "gt", 2)).toBe(false);
    });

    it("should calc ge correctly", async () => {
      expect(await compInt(1, "ge", 1)).toBe(true);
      expect(await compInt(1, "ge", 0)).toBe(true);
      expect(await compInt(1, "ge", 2)).toBe(false);
    });

    it("should calc eq correctly", async () => {
      expect(await compInt(1, "eq", 1)).toBe(true);
      expect(await compInt(1, "eq", 0)).toBe(false);
      expect(await compInt(1, "eq", 2)).toBe(false);
    });

    it("should calc ne correctly", async () => {
      expect(await compInt(1, "ne", 1)).toBe(false);
      expect(await compInt(1, "ne", 0)).toBe(true);
      expect(await compInt(1, "ne", 2)).toBe(true);
    });
  });

  describe("with boolean operand", () => {
    it("should calc lt correctly", async () => {
      expect(await compBool(false, "lt", false)).toBe(false);
      expect(await compBool(true, "lt", true)).toBe(false);
      expect(await compBool(true, "lt", false)).toBe(false);
      expect(await compBool(false, "lt", true)).toBe(true);
    });

    it("should calc le correctly", async () => {
      expect(await compBool(false, "le", false)).toBe(true);
      expect(await compBool(true, "le", true)).toBe(true);
      expect(await compBool(true, "le", false)).toBe(false);
      expect(await compBool(false, "le", true)).toBe(true);
    });

    it("should calc gt correctly", async () => {
      expect(await compBool(false, "gt", false)).toBe(false);
      expect(await compBool(true, "gt", true)).toBe(false);
      expect(await compBool(true, "gt", false)).toBe(true);
      expect(await compBool(false, "gt", true)).toBe(false);
    });

    it("should calc ge correctly", async () => {
      expect(await compBool(false, "ge", false)).toBe(true);
      expect(await compBool(true, "ge", true)).toBe(true);
      expect(await compBool(true, "ge", false)).toBe(true);
      expect(await compBool(false, "ge", true)).toBe(false);
    });

    it("should calc eq correctly", async () => {
      expect(await compBool(false, "eq", false)).toBe(true);
      expect(await compBool(true, "eq", true)).toBe(true);
      expect(await compBool(true, "eq", false)).toBe(false);
      expect(await compBool(false, "eq", true)).toBe(false);
    });

    it("should calc ne correctly", async () => {
      expect(await compBool(false, "ne", false)).toBe(false);
      expect(await compBool(true, "ne", true)).toBe(false);
      expect(await compBool(true, "ne", false)).toBe(true);
      expect(await compBool(false, "ne", true)).toBe(true);
    });
  });

  describe("with floating-number comparison", () => {
    it("should calc lt correctly", async () => {
      expect(await compFloat(0.0, "lt", 0.0)).toBe(false);
      expect(await compFloat(1.0, "lt", 0.0)).toBe(false);
      expect(await compFloat(0.0, "lt", 1.0)).toBe(true);
    });

    it("should calc le correctly", async () => {
      expect(await compFloat(0.0, "le", 0.0)).toBe(true);
      expect(await compFloat(1.0, "le", 0.0)).toBe(false);
      expect(await compFloat(0.0, "le", 1.0)).toBe(true);
    });

    it("should calc gt correctly", async () => {
      expect(await compFloat(0.0, "gt", 0.0)).toBe(false);
      expect(await compFloat(1.0, "gt", 0.0)).toBe(true);
      expect(await compFloat(0.0, "gt", 1.0)).toBe(false);
    });

    it("should calc ge correctly", async () => {
      expect(await compFloat(0.0, "ge", 0.0)).toBe(true);
      expect(await compFloat(1.0, "ge", 0.0)).toBe(true);
      expect(await compFloat(0.0, "ge", 1.0)).toBe(false);
    });
  });

  describe("with list comparison", () => {
    describe("lt", () => {
      test("false::[] < [] = false", async () => {
        expect(
          await compWithModuleCode(
            `
              (module
                (func $test (result i32)
                  ;; L1
                  call $__list_new__
                  i32.const 0
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

      test("false::[] < false::[] = false", async () => {
        expect(
          await compWithModuleCode(
            `
              (module
                (func $test (result i32)
                  ;; L1
                  call $__list_new__
                  i32.const 0
                  call $__list_push__

                  ;; L2
                  call $__list_new__
                  i32.const 0
                  call $__list_push__

                  call $__comparator_poly_lt__
                )
                (export "test" (func $test))
              )
            `,
          ),
        ).toBe(false);
      });

      test("true::[] < false::[] = false", async () => {
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
                  i32.const 0
                  call $__list_push__

                  call $__comparator_poly_lt__
                )
                (export "test" (func $test))
              )
            `,
          ),
        ).toBe(false);
      });

      test("[] < false::[] = true", async () => {
        expect(
          await compWithModuleCode(
            `
              (module
                (func $test (result i32)
                  ;; L1
                  call $__list_new__

                  ;; L2
                  call $__list_new__
                  i32.const 0
                  call $__list_push__

                  call $__comparator_poly_lt__
                )
                (export "test" (func $test))
              )
            `,
          ),
        ).toBe(true);
      });

      test("false::true::[] < true::[] = true", async () => {
        expect(
          await compWithModuleCode(
            `
              (module
                (func $test (result i32)
                  ;; L1
                  call $__list_new__
                  i32.const 1
                  call $__list_push__
                  i32.const 0
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
        ).toBe(true);
      });
    });

    describe("le", () => {
      test("false::[] <= [] = false", async () => {
        expect(
          await compWithModuleCode(
            `
              (module
                (func $test (result i32)
                  ;; L1
                  call $__list_new__
                  i32.const 0
                  call $__list_push__

                  ;; L2
                  call $__list_new__

                  call $__comparator_poly_le__
                )
                (export "test" (func $test))
              )
            `,
          ),
        ).toBe(false);
      });

      test("false::[] <= false::[] = true", async () => {
        expect(
          await compWithModuleCode(
            `
              (module
                (func $test (result i32)
                  ;; L1
                  call $__list_new__
                  i32.const 0
                  call $__list_push__

                  ;; L2
                  call $__list_new__
                  i32.const 0
                  call $__list_push__

                  call $__comparator_poly_le__
                )
                (export "test" (func $test))
              )
            `,
          ),
        ).toBe(true);
      });

      test("true::[] <= false::[] = false", async () => {
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
                  i32.const 0
                  call $__list_push__

                  call $__comparator_poly_le__
                )
                (export "test" (func $test))
              )
            `,
          ),
        ).toBe(false);
      });

      test("[] <= false::[] = true", async () => {
        expect(
          await compWithModuleCode(
            `
              (module
                (func $test (result i32)
                  ;; L1
                  call $__list_new__

                  ;; L2
                  call $__list_new__
                  i32.const 0
                  call $__list_push__

                  call $__comparator_poly_le__
                )
                (export "test" (func $test))
              )
            `,
          ),
        ).toBe(true);
      });

      test("false::true::[] <= true::[] = true", async () => {
        expect(
          await compWithModuleCode(
            `
              (module
                (func $test (result i32)
                  ;; L1
                  call $__list_new__
                  i32.const 1
                  call $__list_push__
                  i32.const 0
                  call $__list_push__

                  ;; L2
                  call $__list_new__
                  i32.const 1
                  call $__list_push__

                  call $__comparator_poly_le__
                )
                (export "test" (func $test))
              )
            `,
          ),
        ).toBe(true);
      });
    });

    describe("gt", () => {
      test("[] > false::[] = false", async () => {
        expect(
          await compWithModuleCode(
            `
              (module
                (func $test (result i32)
                  ;; L1
                  call $__list_new__

                  ;; L2
                  call $__list_new__
                  i32.const 0
                  call $__list_push__

                  call $__comparator_poly_gt__
                )
                (export "test" (func $test))
              )
            `,
          ),
        ).toBe(false);
      });

      test("false::[] > false::[] = false", async () => {
        expect(
          await compWithModuleCode(
            `
              (module
                (func $test (result i32)
                  ;; L1
                  call $__list_new__
                  i32.const 0
                  call $__list_push__

                  ;; L2
                  call $__list_new__
                  i32.const 0
                  call $__list_push__

                  call $__comparator_poly_gt__
                )
                (export "test" (func $test))
              )
            `,
          ),
        ).toBe(false);
      });

      test("false::[] > true::[] = false", async () => {
        expect(
          await compWithModuleCode(
            `
              (module
                (func $test (result i32)
                  ;; L1
                  call $__list_new__
                  i32.const 0
                  call $__list_push__

                  ;; L2
                  call $__list_new__
                  i32.const 1
                  call $__list_push__

                  call $__comparator_poly_gt__
                )
                (export "test" (func $test))
              )
            `,
          ),
        ).toBe(false);
      });

      test("false::[] > [] = true", async () => {
        expect(
          await compWithModuleCode(
            `
              (module
                (func $test (result i32)
                  ;; L1
                  call $__list_new__
                  i32.const 0
                  call $__list_push__

                  ;; L2
                  call $__list_new__

                  call $__comparator_poly_gt__
                )
                (export "test" (func $test))
              )
            `,
          ),
        ).toBe(true);
      });

      test("true::[] > false::true::[] = true", async () => {
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
                  i32.const 0
                  call $__list_push__

                  call $__comparator_poly_gt__
                )
                (export "test" (func $test))
              )
            `,
          ),
        ).toBe(true);
      });
    });

    describe("ge", () => {
      test("[] >= false::[] = false", async () => {
        expect(
          await compWithModuleCode(
            `
              (module
                (func $test (result i32)
                  ;; L1
                  call $__list_new__

                  ;; L2
                  call $__list_new__
                  i32.const 0
                  call $__list_push__

                  call $__comparator_poly_ge__
                )
                (export "test" (func $test))
              )
            `,
          ),
        ).toBe(false);
      });

      test("false::[] >= false::[] = true", async () => {
        expect(
          await compWithModuleCode(
            `
              (module
                (func $test (result i32)
                  ;; L1
                  call $__list_new__
                  i32.const 0
                  call $__list_push__

                  ;; L2
                  call $__list_new__
                  i32.const 0
                  call $__list_push__

                  call $__comparator_poly_ge__
                )
                (export "test" (func $test))
              )
            `,
          ),
        ).toBe(true);
      });

      test("false::[] >= true::[] = false", async () => {
        expect(
          await compWithModuleCode(
            `
              (module
                (func $test (result i32)
                  ;; L1
                  call $__list_new__
                  i32.const 0
                  call $__list_push__

                  ;; L2
                  call $__list_new__
                  i32.const 1
                  call $__list_push__

                  call $__comparator_poly_ge__
                )
                (export "test" (func $test))
              )
            `,
          ),
        ).toBe(false);
      });

      test("false::[] >= [] = true", async () => {
        expect(
          await compWithModuleCode(
            `
              (module
                (func $test (result i32)
                  ;; L1
                  call $__list_new__
                  i32.const 0
                  call $__list_push__

                  ;; L2
                  call $__list_new__

                  call $__comparator_poly_ge__
                )
                (export "test" (func $test))
              )
            `,
          ),
        ).toBe(true);
      });

      test("true::[] >= false::true::[] = true", async () => {
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
                  i32.const 0
                  call $__list_push__

                  call $__comparator_poly_ge__
                )
                (export "test" (func $test))
              )
            `,
          ),
        ).toBe(true);
      });
    });

    describe("eq", () => {
      test("[] = [] = true", async () => {
        expect(
          await compWithModuleCode(
            `
              (module
                (func $test (result i32)
                  ;; L1
                  call $__list_new__

                  ;; L2
                  call $__list_new__

                  call $__comparator_poly_eq__
                )
                (export "test" (func $test))
              )
            `,
          ),
        ).toBe(true);
      });

      test("[] = true::[] = false", async () => {
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

                  call $__comparator_poly_eq__
                )
                (export "test" (func $test))
              )
            `,
          ),
        ).toBe(false);
      });

      test("true::true::[] = true::true::[] = true", async () => {
        expect(
          await compWithModuleCode(
            `
              (module
                (func $test (result i32)
                  ;; L1
                  call $__list_new__
                  i32.const 1
                  call $__list_push__
                  i32.const 1
                  call $__list_push__

                  ;; L2
                  call $__list_new__
                  i32.const 1
                  call $__list_push__
                  i32.const 1
                  call $__list_push__

                  call $__comparator_poly_eq__
                )
                (export "test" (func $test))
              )
            `,
          ),
        ).toBe(true);
      });
    });

    describe("ne", () => {
      test("[] <> [] = false", async () => {
        expect(
          await compWithModuleCode(
            `
              (module
                (func $test (result i32)
                  ;; L1
                  call $__list_new__

                  ;; L2
                  call $__list_new__

                  call $__comparator_poly_ne__
                )
                (export "test" (func $test))
              )
            `,
          ),
        ).toBe(false);
      });

      test("[] <> true::[] = true", async () => {
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

                  call $__comparator_poly_ne__
                )
                (export "test" (func $test))
              )
            `,
          ),
        ).toBe(true);
      });

      test("true::true::[] <> true::true::[] = true", async () => {
        expect(
          await compWithModuleCode(
            `
              (module
                (func $test (result i32)
                  ;; L1
                  call $__list_new__
                  i32.const 1
                  call $__list_push__
                  i32.const 1
                  call $__list_push__

                  ;; L2
                  call $__list_new__
                  i32.const 1
                  call $__list_push__
                  i32.const 1
                  call $__list_push__

                  call $__comparator_poly_ne__
                )
                (export "test" (func $test))
              )
            `,
          ),
        ).toBe(false);
      });
    });
  });
});

async function compInt(left: number, op: ComparisonOperators, right: number, simple = false) {
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
    dependencies: [getComparatorModuleDefinition({ includeOperators: [op], withFloat: !simple, withList: false })],
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

async function compBool(left: boolean, op: ComparisonOperators, right: boolean) {
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
    dependencies: [getComparatorModuleDefinition({ includeOperators: [op], withFloat: true, withList: false })],
  })
    .build()
    .mapValue(generateBinary)
    .unwrap();
  const { instance } = await WebAssembly.instantiate(buf, {});
  return toBoolean(instance, (instance.exports["test"] as Function)(left ? 1 : 0, right ? 1 : 0));
}

async function compFloat(left: number, op: ComparisonOperators, right: number) {
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
    dependencies: [getComparatorModuleDefinition({ includeOperators: [op], withFloat: true, withList: false })],
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
    dependencies: [
      getComparatorModuleDefinition({
        includeOperators: ["lt", "le", "gt", "ge", "eq", "ne"],
        withFloat: true,
        withList: true,
      }),
    ],
  })
    .build()
    .mapValue(generateBinary)
    .unwrap();
  const { instance } = await WebAssembly.instantiate(buf, {});
  return toBoolean(instance, (instance.exports["test"] as Function)());
}
