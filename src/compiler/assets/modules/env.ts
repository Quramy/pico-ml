import { factory } from "../../../wasm";
import { ModuleDefinition } from "../../module-builder";
import { getAllocatorModuleDefinition } from "./alloc";

const definition: ModuleDefinition = {
  name: "lib/environment",
  dependencies: [getAllocatorModuleDefinition()],
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

      (func $__env_parent__ (param $addr i32) (result i32)
        local.get $addr
        i32.load
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

export function initEnvInstr() {
  return [
    factory.numericInstr("i32.const", [factory.int32(0)]),
    factory.variableInstr("local.set", [factory.identifier("current_env_addr")]),
  ];
}

export function newEnvInstr() {
  return [
    factory.controlInstr("call", [factory.identifier("__env_new__")]),
    factory.variableInstr("local.set", [factory.identifier("current_env_addr")]),
  ];
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
