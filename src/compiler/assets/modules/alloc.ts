import { ModuleDefinition } from "../../moduel-builder";

const definition: ModuleDefinition = {
  name: "lib/allocator",
  code: `
    (module
      (memory $__alloc_mem__ 10)
      (global $__alloc_st__ (mut i32) i32.const 0)
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

export function getAllocator() {
  return definition;
}
