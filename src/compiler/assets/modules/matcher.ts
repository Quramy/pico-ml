import { factory } from "../../../wasm";
import { ModuleDefinition } from "../../module-builder";
import { getEnvModuleDefinition } from "./env";
import { getListModuleDefinition } from "./list";

const definition: ModuleDefinition = {
  name: "lib/matcher",
  dependencies: [getEnvModuleDefinition(), getListModuleDefinition()],
  code: `
    (module
      (func $__matcher_is_matched_wildcard_pattern__ (param $current_env i32) (param $value i32) (result i32)
        local.get $current_env
      )

      (func $__matcher_is_matched_empty_list_pattern__ (param $current_env i32) (param $value i32) (result i32)
        local.get $value
        call $__list_is_empty__
        if (result i32)
          local.get $current_env
        else
          i32.const 0
        end
      )

      (func $__matcher_is_matched_identifier_pattern__ (param $current_env i32) (param $value i32) (result i32)
        local.get $current_env
        local.get $value
        call $__env_new__
      )
    )
  `,
};

export function getMatcherModuleDefinition() {
  return definition;
}

export function isMatchedWildcardPatternInstr() {
  return [factory.controlInstr("call", [factory.identifier("__matcher_is_matched_wildcard_pattern__")])];
}

export function isMatchedEmptyListPatternInstr() {
  return [factory.controlInstr("call", [factory.identifier("__matcher_is_matched_empty_list_pattern__")])];
}

export function isMatchedIdentifierPatternInstr() {
  return [factory.controlInstr("call", [factory.identifier("__matcher_is_matched_identifier_pattern__")])];
}
