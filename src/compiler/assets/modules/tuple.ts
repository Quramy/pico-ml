import { wat } from "../../../wasm";
import { ModuleDefinition } from "../../module-builder";
import { getAllocatorModuleDefinition } from "./alloc";

const definition: ModuleDefinition = {
  name: "lib/tuple",
  dependencies: [getAllocatorModuleDefinition()],
  code: `
    (module
      (func $__tuple_new__ (param $v0 i32) (param $v1 i32) (result i32) (local $addr i32)
        i32.const 8
        call $__malloc__
        local.set $addr

        local.get $addr
        local.get $v0
        i32.store offset=0

        local.get $addr
        local.get $v1
        i32.store offset=4

        local.get $addr
      )
      (func $__tuple_get_v0__ (param $addr i32) (result i32)
        local.get $addr
        i32.load offset=0
      )
      (func $__tuple_get_v1__ (param $addr i32) (result i32)
        local.get $addr
        i32.load offset=4
      )
    )
  `,
};

export function getTupleModuleDefinition() {
  return definition;
}

export const newTupleInstr = wat.instructions`
  call $__tuple_new__
`;

export const getTupleValueInstr = (index: 0 | 1) =>
  wat.instructions`
    call $__tuple_get_v${index}__
  `();
