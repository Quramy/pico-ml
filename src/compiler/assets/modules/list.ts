import { factory } from "../../../wasm";
import { ModuleDefinition } from "../../module-builder";
import { getAllocatorModuleDefinition } from "./alloc";

const definition: ModuleDefinition = {
  name: "lib/list",
  dependencies: [getAllocatorModuleDefinition()],
  code: `
    (module
      (func $__list__new__ (result i32)
        i32.const 0
      )

      (func $__list_push__ (param $list_addr i32) (param $value i32) (result i32) (local $new_list_addr i32)
        i32.const 8
        call $__malloc__
        local.tee $new_list_addr
        local.get $list_addr
        i32.store offset=0

        local.get $new_list_addr
        local.get $value
        i32.store offset=4

        local.get $new_list_addr
      )

      (func $__list_is_empty__ (param $list_addr i32) (result i32)
        local.get $list_addr
      )

      (func $__list_head__ (param $list_addr i32) (result i32)
        local.get $list_addr
        i32.load offset=4
      )

      (func $__list_tail__ (param $list_addr i32) (result i32)
        local.get $list_addr
        i32.load offset=0
      )
    )
  `,
};

export function getListModuleDefinition() {
  return definition;
}

export function newListInstr() {
  return [factory.controlInstr("call", [factory.identifier("__list__new__")])];
}
