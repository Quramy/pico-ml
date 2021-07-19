import { ModuleDefinition } from "../../module-builder";
import { getListModuleDefinition } from "./list";
import { getFloatModuleDefinition } from "./float";

export type ComparisonOperators = "lt" | "le" | "gt" | "ge";

export function getComparatorModuleDefinition({}: {
  readonly includeOperators: readonly ComparisonOperators[];
  readonly withFloat: boolean;
  readonly withList: boolean;
}): ModuleDefinition {
  return {
    name: "lib/comparator",
    code: `
      (module
        (func $__comparator_list_lt__ (param $l1 i32) (param $l2 i32) (result i32)
          local.get $l1
          if (result i32)
            local.get $l2
            if (result i32)
              local.get $l1
              call $__list_head__
              local.get $l2
              call $__list_head__
              call $__comparator_poly_lt__
              if (result i32)
                i32.const 1
              else
                local.get $l1
                call $__list_tail__
                local.get $l2
                call $__list_tail__
                call $__comparator_list_lt__
              end
            else
              ;; if List.length l1 > 1 and List.length l2 = 0 then false
              i32.const 0
            end
          else
            local.get $l1
            local.get $l2
            i32.lt_s
          end
        )

        (func $__comparator_poly_lt__ (param $left i32) (param $right i32) (result i32) (local $tag i32)
          local.get $left
          i32.const 1
          i32.and
          if (result i32)
            ;; $left is true or signed-integer
            local.get $left
            local.get $right
            i32.lt_s
          else
            ;; $left is false or empty list or address
            local.get $left
            if (result i32)
              local.get $left
              i32.const 14
              i32.and
              local.tee $tag
              i32.const 2
              i32.eq
              if (result i32)
                ;; $left and $right is floating-point number
                local.get $left
                call $__float_get__
                local.get $right
                call $__float_get__
                f64.lt
              else
                local.get $tag
                i32.const 4
                i32.eq
                if (result i32)
                  ;; $left is non-empty list
                  local.get $left
                  local.get $right
                  call $__comparator_list_lt__
                else
                  unreachable
                end
              end
            else
              ;; $left is false or emptyList
              local.get $left
              local.get $right
              i32.lt_s
            end
          end
        )

        (func $__comparator_poly_le__ (param $a i32) (param $b i32) (result i32)
          i32.const 0
        )

        (func $__comparator_poly_gt__ (param $a i32) (param $b i32) (result i32)
          i32.const 0
        )

        (func $__comparator_poly_ge__ (param $a i32) (param $b i32) (result i32)
          i32.const 0
        )
      )
    `,
    dependencies: [getFloatModuleDefinition(), getListModuleDefinition()],
  };
}
