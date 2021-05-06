import { printAST, factory } from "../wasm";
import { ModuleBuilder, ModuleDefinition } from "./module-builder";

describe(ModuleBuilder, () => {
  it("should build from simple module definition", () => {
    const mod = new ModuleBuilder({ name: "main", code: `(module (memory 1))` }).build().unwrap();
    expect(oneline(printAST(mod))).toBe(`(module (memory 1))`);
  });

  it("should build from module with dependencies", () => {
    const dep: ModuleDefinition = {
      name: "dep",
      code: `
        (module
          (func $fn (result i32)
            i32.const 0
          )
        )
      `,
    };
    const def: ModuleDefinition = {
      name: "main",
      code: `
        (module
          (func $main (result i32)
            call $fn
          )
        )
      `,
      dependencies: [dep],
    };
    const mod = new ModuleBuilder(def)
      .addField(factory.exportNode("main", factory.exportedFunc(factory.identifier("main"))))
      .build()
      .unwrap();
    const expectedSource = `
      (module
        (func $fn (result i32)
          i32.const 0
        )
        (func $main (result i32)
          call $fn
        )
        (export "main" (func $main))
      )
    `;
    expect(oneline(printAST(mod))).toBe(oneline(expectedSource));
  });

  it("should import diamond dependencies once", () => {
    const dep0: ModuleDefinition = {
      name: "dep0",
      code: `
        (module
          (memory 1)
        )
      `,
    };
    const dep1: ModuleDefinition = {
      name: "dep1",
      code: `
        (module
          (global i32 i32.const 0)
        )
      `,
      dependencies: [dep0],
    };
    const def: ModuleDefinition = {
      name: "main",
      code: `
        (module
          (func $main (result i32)
            i32.const 0
          )
        )
      `,
      dependencies: [dep0, dep1],
    };
    const mod = new ModuleBuilder(def).build().unwrap();
    const expectedSource = `
      (module
        (memory 1)
        (global i32 i32.const 0)
        (func $main (result i32)
          i32.const 0
        )
      )
    `;
    expect(oneline(printAST(mod))).toBe(oneline(expectedSource));
  });

  it("should work with complex dependencies", () => {
    const depA: ModuleDefinition = {
      name: "moduleA",
      code: ` (module (global $a i32 i32.const 0))`,
    };
    const depB: ModuleDefinition = {
      name: "moduleB",
      code: ` (module (global $b i32 i32.const 1))`,
      dependencies: [depA],
    };
    const depC: ModuleDefinition = {
      name: "moduleC",
      code: ` (module (global $c i32 i32.const 2))`,
      dependencies: [depB],
    };
    const depD: ModuleDefinition = {
      name: "moduleD",
      code: ` (module (global $d i32 i32.const 3))`,
      dependencies: [depB],
    };
    const depE: ModuleDefinition = {
      name: "moduleE",
      code: ` (module (global $e i32 i32.const 4))`,
      dependencies: [depC, depD],
    };
    const depF: ModuleDefinition = {
      name: "moduleF",
      code: ` (module (global $f i32 i32.const 5))`,
      dependencies: [depC, depE],
    };
    const mod = new ModuleBuilder(depF).build().unwrap();
    const expectedSource = `
      (module
        (global $a i32 i32.const 0)
        (global $b i32 i32.const 1)
        (global $d i32 i32.const 3)
        (global $c i32 i32.const 2)
        (global $e i32 i32.const 4)
        (global $f i32 i32.const 5)
      )
    `;
    expect(oneline(printAST(mod))).toBe(oneline(expectedSource));
  });
});

function oneline(text: string) {
  return text.trim().replace(/\n/g, " ").replace(/\s+/g, " ").replace(/\s*\)/g, ")");
}
