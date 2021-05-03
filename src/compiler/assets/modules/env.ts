import { ModuleDefinition } from "../../moduel-builder";
import { getAllocator } from "./alloc";

const definition: ModuleDefinition = {
  name: "lib/environment",
  dependencies: [getAllocator()],
  code: `
    (module
      (func $__env_new__ (param $parent_addr i32) (param $value i32) (result i32) (local $addr i32)
        i32.const 8
        call $__malloc__ 
        local.set $addr

        local.get $addr
        local.get $parent_addr
        i32.store

        local.get $addr
        local.get $value
        i32.store offset=4

        local.get $addr
      )

      (func $__env_get__ (param $addr i32) (param $idx i32) (result i32)
        local.get $idx
        i32.const 0
        i32.le_s
        if (result i32)
          local.get $addr
          i32.load offset=4
        else
          local.get $addr
          i32.load
          local.get $idx
          i32.const 1
          i32.sub
          call $__env_get__
        end
      )
    )
  `,
};

export function getEnv() {
  return definition;
}
