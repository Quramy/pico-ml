import { wat, factory } from "../../../wasm";
import { ModuleDefinition } from "../../module-builder";
import { getListModuleDefinition } from "./list";
import { getFloatModuleDefinition } from "./float";

export type ComparisonOperators = "eq" | "ne" | "lt" | "le" | "gt" | "ge";

const polymorphicComparatorTemplate = (
  op: ComparisonOperators,
  { withFloat, withList }: { readonly withList: boolean; readonly withFloat: boolean },
) => {
  if (!withFloat && !withList) {
    return `
      (func $__comparator_poly_${op}__ (param $left i32) (param $right i32) (result i32)
        local.get $left
        local.get $right
        i32.${op}_s
      )
    `;
  }
  const ifFloatBlock = withFloat
    ? `
        local.get $tag
        i32.const 2
        i32.eq
        if (result i32)
          ;; $left and $right is floating-point number
          local.get $left
          call $__float_get__
          local.get $right
          call $__float_get__
          f64.${op}
        else
    `
    : "";
  const endIfFloat = withFloat ? "end" : "";
  const ifListBlock = withList
    ? `
        local.get $tag
        i32.const 4
        i32.eq
        if (result i32)
          ;; $left is non-empty list
          local.get $left
          local.get $right
          call $__comparator_list_${op}__
        else
       `
    : "";
  const endIfList = withList ? "end" : "";
  return `
    (func $__comparator_poly_${op}__ (param $left i32) (param $right i32) (result i32) (local $tag i32)
      local.get $left
      i32.const 1
      i32.and
      if (result i32)
        ;; $left is true or signed-integer
        local.get $left
        local.get $right
        i32.${op}_s
      else
        ;; $left is false or empty list or address
        local.get $left
        if (result i32)
          local.get $left
          i32.const 14
          i32.and
          local.set $tag
          ${ifFloatBlock}
            ${ifListBlock}
              unreachable
            ${endIfList}
          ${endIfFloat}
        else
          ;; $left is false or emptyList
          local.get $left
          local.get $right
          i32.${op}_s
        end
      end
    )
  `;
};

const listComparatorTemplate = (op: ComparisonOperators) => `
  (func $__comparator_list_${op}__ (param $l1 i32) (param $l2 i32) (result i32) (local $h1 i32) (local $h2 i32)
    local.get $l1
    if (result i32)
      local.get $l2
      if (result i32)
        local.get $l1
        call $__list_head__
        local.tee $h1
        local.get $l2
        call $__list_head__
        local.tee $h2
        call $__comparator_poly_${op}__
        if (result i32)
          i32.const 1
        else
          local.get $h1
          local.get $h2
          call $__comparator_poly_eq__
          if (result i32)
            local.get $l1
            call $__list_tail__
            local.get $l2
            call $__list_tail__
            call $__comparator_list_${op}__
          else
            i32.const 0
          end
        end
      else
        ${op === "gt" || op === "ge" ? "i32.const 1" : "i32.const 0"}
      end
    else
      local.get $l1
      local.get $l2
      ${op === "eq" ? "i32.eq" : "i32." + op + "_s"}
    end
  )
`;

const polymorphicEqualityTemplate = ({
  withFloat,
  withList,
}: {
  readonly withList: boolean;
  readonly withFloat: boolean;
}) => {
  if (!withFloat && !withList) {
    return `
      (func $__comparator_poly_eq__ (param $left i32) (param $right i32) (result i32)
        local.get $left
        local.get $right
        i32.eq
      )
    `;
  }
  const ifFloatBlock = withFloat
    ? `
        local.get $tag
        i32.const 2
        i32.eq
        if (result i32)
          ;; $left and $right is floating-point number
          local.get $left
          call $__float_get__
          local.get $right
          call $__float_get__
          f64.eq
        else
    `
    : "";
  const endIfFloat = withFloat ? "end" : "";
  const ifListBlock = withList
    ? `
        local.get $tag
        i32.const 4
        i32.eq
        if (result i32)
          ;; $left is non-empty list
          local.get $left
          local.get $right
          call $__comparator_list_eq__
        else
       `
    : "";
  const endIfList = withList ? "end" : "";
  return `
    (func $__comparator_poly_eq__ (param $left i32) (param $right i32) (result i32) (local $tag i32)
      local.get $left
      i32.const 1
      i32.and
      if (result i32)
        local.get $left
        local.get $right
        i32.eq
      else
        local.get $left
        if (result i32)
          local.get $left
          i32.const 14
          i32.and
          local.set $tag
          ${ifFloatBlock}
            ${ifListBlock}
              unreachable
            ${endIfList}
          ${endIfFloat}
        else
          local.get $left
          local.get $right
          i32.eq
        end
      end
    )
  `;
};

const polymorphicNotEqualityTemplate = () => `
  (func $__comparator_poly_ne__ (param $left i32) (param $right i32) (result i32)
    local.get $left
    local.get $right
    call $__comparator_poly_eq__
    i32.const 1
    i32.xor
  )
`;

export function getComparatorModuleDefinition({
  includeOperators,
  withFloat,
  withList,
}: {
  readonly includeOperators: readonly ComparisonOperators[];
  readonly withFloat: boolean;
  readonly withList: boolean;
}): ModuleDefinition {
  const hasEq = includeOperators.indexOf("eq") !== -1;
  const hasNe = includeOperators.indexOf("ne") !== -1;
  const hasLt = includeOperators.indexOf("lt") !== -1;
  const hasLe = includeOperators.indexOf("le") !== -1;
  const hasGt = includeOperators.indexOf("gt") !== -1;
  const hasGe = includeOperators.indexOf("ge") !== -1;
  return {
    name: "lib/comparator",
    code: `
      (module

        ${hasLt ? polymorphicComparatorTemplate("lt", { withList, withFloat }) : ""}
        ${hasLt && withList ? listComparatorTemplate("lt") : ""}

        ${hasLe ? polymorphicComparatorTemplate("le", { withList, withFloat }) : ""}
        ${hasLe && withList ? listComparatorTemplate("le") : ""}

        ${hasGt ? polymorphicComparatorTemplate("gt", { withList, withFloat }) : ""}
        ${hasGt && withList ? listComparatorTemplate("gt") : ""}

        ${hasGe ? polymorphicComparatorTemplate("ge", { withList, withFloat }) : ""}
        ${hasGe && withList ? listComparatorTemplate("ge") : ""}

        ${withList ? listComparatorTemplate("eq") : ""}
        ${hasEq || hasNe || withList ? polymorphicEqualityTemplate({ withList, withFloat }) : ""}

        ${hasNe ? polymorphicNotEqualityTemplate() : ""}
      )
    `,
    dependencies: [
      ...(withFloat ? [getFloatModuleDefinition()] : []),
      ...(withList ? [getListModuleDefinition()] : []),
    ],
  };
}

export const compareInstr = (op: ComparisonOperators) =>
  wat.instructions`
    call $__comparator_poly_${op}__
  `();

export function intCompareInstr(op: ComparisonOperators) {
  if (op == "eq" || op == "ne") {
    return [factory.int32NumericInstr(`i32.${op}`)];
  } else {
    return [factory.int32NumericInstr(`i32.${op}_s`)];
  }
}

export const floatCompareInstr = (op: ComparisonOperators) =>
  wat.instructions`
    f64.${op}
  `();
