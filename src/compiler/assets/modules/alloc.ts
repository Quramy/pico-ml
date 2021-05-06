import { factory } from "../../../wasm";
import { ModuleDefinition } from "../../module-builder";

const definition: ModuleDefinition = {
  name: "lib/allocator",
  code: `
    (module
      (memory $__alloc_mem__ 10)
      (global $__alloc_st__ (mut i32) i32.const 4)
      (func $__malloc__ (param $size i32) (result i32) (local $next i32)

        global.get $__alloc_st__
        local.set $next

        global.get $__alloc_st__
        local.get $size
        i32.add

        global.set $__alloc_st__
        local.get $next
      )
    )
  `,
};

export function getAllocatorModuleDefinition() {
  return definition;
}

export function mallocInstr(byteLength: number) {
  return [
    factory.numericInstr("i32.const", [factory.int32(byteLength)]),
    factory.controlInstr("call", [factory.identifier("__malloc__")]),
  ];
}
