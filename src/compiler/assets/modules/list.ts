import { factory } from "../../../wasm";
import { ModuleDefinition } from "../../module-builder";
import { getTupleModuleDefinition } from "./tuple";

const definition: ModuleDefinition = {
  name: "lib/list",
  dependencies: [getTupleModuleDefinition()],
  code: `
    (module
      (func $__list_new__ (result i32)
        i32.const 0
      )

      (func $__list_push__ (param $list_addr i32) (param $value i32) (result i32)
        local.get $list_addr
        local.get $value
        call $__tuple_new__
      )

      (func $__list_is_empty__ (param $list_addr i32) (result i32)
        local.get $list_addr
        i32.const 0
        i32.eq
      )

      (func $__list_head__ (param $list_addr i32) (result i32)
        local.get $list_addr
        call $__tuple_get_v1__
      )

      (func $__list_tail__ (param $list_addr i32) (result i32)
        local.get $list_addr
        call $__tuple_get_v0__
      )

      (export "__list_head__" (func $__list_head__))
      (export "__list_tail__" (func $__list_tail__))
    )
  `,
};

export function getListModuleDefinition() {
  return definition;
}

export function newListInstr() {
  return [factory.controlInstr("call", [factory.identifier("__list_new__")])];
}

export function pushLishInstr() {
  return [factory.controlInstr("call", [factory.identifier("__list_push__")])];
}

export function isEmptyListInstr() {
  return [factory.controlInstr("call", [factory.identifier("__list_is_empty__")])];
}

export function getHeadValueInstr() {
  return [factory.controlInstr("call", [factory.identifier("__list_head__")])];
}

export function getTailAddrInstr() {
  return [factory.controlInstr("call", [factory.identifier("__list_tail__")])];
}
