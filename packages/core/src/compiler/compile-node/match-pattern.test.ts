import { parseMatchPattern } from "../../syntax";
import { generateBinaryWithDefaultOptions as generateBinary } from "../../wasm";
import { Context } from "../compiler-context";
import { matchPattern } from "./match-pattern";
import { ModuleBuilder } from "../module-builder";
import { ValueExtractor } from "../js-bindings";

export function toListAnd<T>(conv: ValueExtractor<T>) {
  return (instance: WebAssembly.Instance, value: number) => {
    const getTail = instance.exports["__tuple_get_v0__"] as (addr: number) => number;
    const getHeadValue = instance.exports["__tuple_get_v1__"] as (addr: number) => number;
    const inner = (addr: number): readonly number[] => {
      if (addr > 0) {
        return [getHeadValue(addr), ...inner(getTail(addr))];
      } else {
        return [];
      }
    };
    return inner(value).map(x => conv(instance, x));
  };
}

export function toEnvironmentList(instance: WebAssembly.Instance, value: number) {
  return toListAnd((_, x) => x)(instance, value);
}

describe(matchPattern, () => {
  describe("compilation empty list pattern", () => {
    it("should match when value is an empty list", async () => {
      const patternSource = `[]`;
      const testModuleSource = `
        (module
          (func $test (result i32)
            i32.const -1
            call $__list_new__
            call $__matcher_0__
          )
          (export "test" (func $test))
        )
      `;
      const { instance } = await build(patternSource, testModuleSource);
      const addr = (instance.exports["test"] as Function)();
      expect(addr).toBeTruthy();
      expect(toEnvironmentList(instance, addr)).toEqual([]);
    });

    it("should not match when value has head", async () => {
      const patternSource = `[]`;
      const testModuleSource = `
        (module
          (func $test (result i32)
            i32.const -1
            call $__list_new__
            i32.const 1
            call $__list_push__
            call $__matcher_0__
          )
          (export "test" (func $test))
        )
      `;
      const { instance } = await build(patternSource, testModuleSource);
      const addr = (instance.exports["test"] as Function)();
      expect(addr).toBeFalsy();
    });
  });

  describe("compilation wildcard pattern", () => {
    it("should match anything", async () => {
      const patternSource = `_`;
      const testModuleSource = `
        (module
          (func $test (result i32)
            i32.const -1
            i32.const 100
            call $__matcher_0__
          )
          (export "test" (func $test))
        )
      `;
      const { instance } = await build(patternSource, testModuleSource);
      const addr = (instance.exports["test"] as Function)();
      expect(addr).toBeTruthy();
      expect(toEnvironmentList(instance, addr)).toEqual([]);
    });
  });

  describe("compilation identifier pattern", () => {
    it("should match anything and store the value to environment", async () => {
      const patternSource = `x`;
      const testModuleSource = `
        (module
          (func $test (result i32)
            i32.const -1
            i32.const 100
            call $__matcher_0__
          )
          (export "test" (func $test))
        )
      `;
      const { instance } = await build(patternSource, testModuleSource);
      const addr = (instance.exports["test"] as Function)();
      expect(addr).toBeTruthy();
      expect(toEnvironmentList(instance, addr)).toEqual([100]);
    });
  });

  describe("compilation cons list pattern", () => {
    it("should match anything and store the head value to environment", async () => {
      const patternSource = `x::y::[]`;
      const testModuleSource = `
        (module
          (func $test (result i32)
            i32.const -1
            call $__list_new__
            i32.const 100
            call $__list_push__
            i32.const 200
            call $__list_push__
            call $__matcher_0__
          )
          (export "test" (func $test))
        )
      `;
      const { instance } = await build(patternSource, testModuleSource);
      const addr = (instance.exports["test"] as Function)();
      expect(addr).toBeTruthy();
      expect(toEnvironmentList(instance, addr)).toEqual([100, 200]);
    });

    it("should not match when pattern's length is greater than the value's one", async () => {
      const patternSource = `x::y::[]`;
      const testModuleSource = `
        (module
          (func $test (result i32)
            i32.const -1
            call $__list_new__
            i32.const 100
            call $__list_push__
            call $__matcher_0__
          )
          (export "test" (func $test))
        )
      `;
      const { instance } = await build(patternSource, testModuleSource);
      const addr = (instance.exports["test"] as Function)();
      expect(addr).toBeFalsy();
    });

    it("should work with wildcard pattern", async () => {
      const patternSource = `x::_::[]`;
      const testModuleSource = `
        (module
          (func $test (result i32)
            i32.const -1
            call $__list_new__
            i32.const 100
            call $__list_push__
            i32.const 200
            call $__list_push__
            call $__matcher_0__
          )
          (export "test" (func $test))
        )
      `;
      const { instance } = await build(patternSource, testModuleSource);
      const addr = (instance.exports["test"] as Function)();
      expect(addr).toBeTruthy();
      expect(toEnvironmentList(instance, addr)).toEqual([200]);
    });
  });
});

const build = (patternCode: string, testCode: string) => {
  const node = parseMatchPattern(patternCode).unwrap();
  const ctx = new Context();
  ctx.useMatcher();
  ctx.matcherDefStack.enter();
  const expr = matchPattern(node, ctx).unwrap();
  ctx.matcherDefStack.leave(expr);
  return (
    new ModuleBuilder({
      name: "test",
      code: testCode,
    })
      .addDependency({
        name: "test-tuple-exports",
        code: `
          (module
            (export "__tuple_get_v0__" (func $__tuple_get_v0__))
            (export "__tuple_get_v1__" (func $__tuple_get_v1__))
          )
        `,
      })
      .addDependencies(ctx.getDependencies())
      .addFields(ctx.matcherDefStack.buildFuncs())
      .build()
      // .tap(mod => console.log(printAST(mod)))
      .mapValue(generateBinary)
      .map(buf => WebAssembly.instantiate(buf, {}))
      .unwrap()
  );
};
