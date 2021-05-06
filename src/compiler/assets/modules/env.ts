import { factory } from "../../../wasm";
import { ModuleDefinition } from "../../module-builder";
import { getTupleModuleDefinition } from "./tuple";

const definition: ModuleDefinition = {
  name: "lib/environment",
  dependencies: [getTupleModuleDefinition()],
  code: `
    (module
      (func $__env_new__ (param $parent_addr i32) (param $value i32) (result i32)
        local.get $parent_addr
        local.get $value
        call $__tuple_new__
      )

      (func $__env_get__ (param $addr i32) (param $idx i32) (result i32)
        local.get $idx
        if (result i32)
          local.get $addr
          i32.load
          local.get $idx
          i32.const 1
          i32.sub
          call $__env_get__
        else
          local.get $addr
          call $__tuple_get_v1__
        end
      )

      (func $__env_parent__ (param $addr i32) (result i32)
        local.get $addr
        call $__tuple_get_v0__
      )
    )
  `,
};

export function getEnvModuleDefinition() {
  return definition;
}

export function localVarTypeForEnv() {
  return factory.localVar(factory.valueType("i32"), factory.identifier("current_env_addr"));
}

export function paramTypeForEnv() {
  return factory.paramType(factory.valueType("i32"), factory.identifier("current_env_addr"));
}

export function initEnvInstr() {
  return [
    factory.numericInstr("i32.const", [factory.int32(-1)]),
    factory.variableInstr("local.set", [factory.identifier("current_env_addr")]),
  ];
}

export function newEnvInstr() {
  return [factory.controlInstr("call", [factory.identifier("__env_new__")])];
}

export function newEnvInstrForLet() {
  return [...newEnvInstr(), factory.variableInstr("local.set", [factory.identifier("current_env_addr")])];
}

export function getEnvAddrInstr() {
  return [factory.variableInstr("local.get", [factory.identifier("current_env_addr")])];
}

export function setEnvAddrInstr() {
  return [factory.variableInstr("local.set", [factory.identifier("current_env_addr")])];
}

export function popEnvInstr() {
  return [
    factory.variableInstr("local.get", [factory.identifier("current_env_addr")]),
    factory.controlInstr("call", [factory.identifier("__env_parent__")]),
    factory.variableInstr("local.set", [factory.identifier("current_env_addr")]),
  ];
}

export function getEnvValueInstr(index: number) {
  return [
    factory.variableInstr("local.get", [factory.identifier("current_env_addr")]),
    factory.numericInstr("i32.const", [factory.int32(index)]),
    factory.controlInstr("call", [factory.identifier("__env_get__")]),
  ];
}
