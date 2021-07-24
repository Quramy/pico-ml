import { wat, factory, InstructionNode } from "../../../wasm";
import { ModuleDefinition } from "../../module-builder";
import { getTupleModuleDefinition } from "./tuple";
import { isLocalGet, isLocalSet, isCalling } from "../../analysis-util/node-detector";

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

export const initEnvInstr = wat.instructions`
  i32.const -1
  local.set $current_env_addr
`;

export const newEnvInstr = wat.instructions`
  call $__env_new__
`;

export const newEnvInstrForLet = wat.instructions`
  ${newEnvInstr}
  local.set $current_env_addr
`;

export const getEnvAddrInstr = wat.instructions`
  local.get $current_env_addr
`;

export const setEnvAddrInstr = wat.instructions`
  local.set $current_env_addr
`;

export const popEnvInstr = wat.instructions`
  local.get $current_env_addr
  call $__env_parent__
  local.set $current_env_addr
`;

export const getEnvValueInstr = (index: number) =>
  wat.instructions`
    local.get $current_env_addr
    i32.const ${index}
    call $__env_get__
  `();

export function reducePopEnvInstructions(instructions: readonly InstructionNode[]) {
  if (instructions.length < 3) return instructions;
  const [l1, l2, l3] = instructions.slice(-3);
  if (isLocalGet(l1, "current_env_addr") && isCalling(l2, "__env_parent__") && isLocalSet(l3, "current_env_addr")) {
    return instructions.slice(0, instructions.length - 3);
  } else {
    return instructions;
  }
}
