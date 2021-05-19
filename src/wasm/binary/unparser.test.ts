import { parse } from "../wat/parser";
import { convertModule } from "../converter";
import { Module } from "../structure-types";
import { unparse as baseUnparse } from "./unparser";

const unparse = (mod: Module) => baseUnparse(mod, { enabledNameSection: false });

describe(unparse, () => {
  describe("unparse result should work as WebAssembly buffered source", () => {
    test("Add function example", async () => {
      const source = `
        (module
          (func $add (param $a i32) (param $b i32) (result i32)
            local.get $a
            local.get $b
            i32.add
          )
          (export "main" (func $add))
        )
      `;
      const buf = parse(source).mapValue(convertModule).map(unparse).unwrap();
      const { instance } = await WebAssembly.instantiate(buf, {});
      expect((instance.exports["main"] as Function)(1, 2)).toBe(3);
    });

    test("Local variable  example", async () => {
      const source = `
        (module
          (func $add (param $a i32) (result i32) (local $x i32)
            local.get $a
            i32.const 2
            i32.mul
            local.set $x
            local.get $x
          )
          (export "main" (func $add))
        )
      `;
      const buf = parse(source).mapValue(convertModule).map(unparse).unwrap();
      const { instance } = await WebAssembly.instantiate(buf, {});
      expect((instance.exports["main"] as Function)(1)).toBe(2);
    });

    test("If instruction example", async () => {
      const source = `
        (module
          (func $main (param $x i32) (result i32)
            local.get $x
            if $l1 (result i32)
              i32.const 0
            else
              i32.const 1
            end
          )
          (export "main" (func $main))
        )
      `;
      const buf = parse(source).mapValue(convertModule).map(unparse).unwrap();
      const { instance } = await WebAssembly.instantiate(buf, {});
      expect(instance).toBeTruthy();
      expect((instance.exports["main"] as Function)(1)).toBe(0);
      expect((instance.exports["main"] as Function)(0)).toBe(1);
    });

    test("Add function example", async () => {
      const source = `
        (module
          (func $add (param $a i32) (param $b i32) (result i32)
            local.get $a
            local.get $b
            i32.add
          )
          (func $twice (param $x i32) (result i32)
            local.get $x
            local.get $x
            call $add
          )
          (export "main" (func $twice))
        )
      `;
      const buf = parse(source).mapValue(convertModule).map(unparse).unwrap();
      const { instance } = await WebAssembly.instantiate(buf, {});
      expect((instance.exports["main"] as Function)(2)).toBe(4);
    });

    test("Memory instruction example", async () => {
      const source = `
        (module
          (memory $mem 1 2)
          (func $memSet (param $addr i32) (param $val i32)
            local.get $addr
            local.get $val
            i32.store
          )
          (export "memSet" (func $memSet))
          (export "mem" (memory $mem))
        )
      `;
      const buf = parse(source).mapValue(convertModule).map(unparse).unwrap();
      const { instance } = await WebAssembly.instantiate(buf, {});
      const memSet = instance.exports["memSet"] as Function;
      const mem = instance.exports["mem"] as WebAssembly.Memory;
      memSet(0, 10);
      memSet(4, -500);
      expect([...new Int32Array(mem.buffer)].slice(0, 2)).toEqual([10, -500]);
    });

    test("Global variable  example", async () => {
      const source = `
        (module
          (global $delta i32 i32.const 10)
          (global $state (mut i32) i32.const 0)
          (func $increment
            global.get $delta
            global.get $state
            i32.add
            global.set $state
          )
          (export "main" (func $increment))
          (export "count" (global $state))
        )
      `;
      const buf = parse(source).mapValue(convertModule).map(unparse).unwrap();
      const { instance } = await WebAssembly.instantiate(buf, {});
      expect((instance.exports["count"] as WebAssembly.Global).value as number).toBe(0);
      (instance.exports["main"] as Function)();
      expect((instance.exports["count"] as WebAssembly.Global).value as number).toBe(10);
      (instance.exports["main"] as Function)();
      expect((instance.exports["count"] as WebAssembly.Global).value as number).toBe(20);
    });

    test("Table and call_indirect example", async () => {
      const source = `
        (module
          (type $fn_inner (func (param i32) (result i32)))
          (func $fn (param $a i32) (result i32)
            i32.const 2
            local.get $a
            i32.mul
          )
          (func $main (param $a i32) (result i32)
            local.get $a
            i32.const 0
            call_indirect $tbl (type $fn_inner)
          )
          (table $tbl funcref (elem $fn))
          (export "main" (func $main))
          (export "table" (table $tbl))
        )
      `;
      const buf = parse(source).mapValue(convertModule).map(unparse).unwrap();
      const { instance } = await WebAssembly.instantiate(buf, {});
      expect((instance.exports["main"] as Function)(10)).toBe(20);
    });
  });
});
