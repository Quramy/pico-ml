import { wat } from "../../../wasm";
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

        ;; Note:
        ;; We should add the following tag to LSB 4-bits of the list address.
        ;; [0100] = 0x4
        i32.const 4
        i32.shl
        i32.const 4
        i32.or
      )

      (func $__list_is_empty__ (param $list_addr i32) (result i32)
        local.get $list_addr
        i32.const 0
        i32.eq
      )

      (func $__list_head__ (param $list_addr i32) (result i32)
        local.get $list_addr
        i32.const 4
        i32.shr_u
        call $__tuple_get_v1__
      )

      (func $__list_tail__ (param $list_addr i32) (result i32)
        local.get $list_addr
        i32.const 4
        i32.shr_u
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

export const newListInstr = wat.instructions`
  call $__list_new__
`;

export const pushListInstr = wat.instructions`
  call $__list_push__
`;

export const isEmptyListInstr = wat.instructions`
  call $__list_is_empty__
`;

export const getHeadValueInstr = wat.instructions`
  call $__list_head__
`;

export const getTailAddrInstr = wat.instructions`
  call $__list_tail__
`;
