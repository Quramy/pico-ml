import { wat, factory, InstructionNode } from "../../../wasm";
import { ModuleDefinition } from "../../module-builder";
import { getAllocatorModuleDefinition } from "./alloc";
import { isCalling } from "../../analysis-util/is-calling";

const definition: ModuleDefinition = {
  name: "lib/float",
  code: `
    (module
      (func $__float_new__ (param $value f64) (result i32) (local $addr i32)
        i32.const 8
        call $__malloc__
        local.tee $addr
        local.get $value
        f64.store offset=0
        local.get $addr

        ;; Note:
        ;; We should add the following tag to LSB 4-bits of the floating-point number address.
        ;; [0010] = 0x2

        i32.const 4
        i32.shl 
        i32.const 2
        i32.or
      )
      (func $__float_get__ (param $addr i32) (result f64)
        local.get $addr
        i32.const 4
        i32.shr_u
        f64.load offset=0
      )
      (export "__float_get__" (func $__float_get__))
    )
  `,
  dependencies: [getAllocatorModuleDefinition()],
};

export function getFloatModuleDefinition() {
  return definition;
}

export const newFloatInstr = (value: number) =>
  wat.instructions`
    ${() => factory.float64NumericInstr("f64.const", [factory.float64(value)])}
    call $__float_new__
  `();

export const storeFloatValueInstr = wat.instructions`
  call $__float_new__
`;

export const getFloatValueInstr = wat.instructions`
  call $__float_get__
`;

export const reduceInstructions = (instructions: readonly InstructionNode[]) =>
  instructions.reduce((acc, node) => {
    if (!isCalling(node, "__float_get__")) return [...acc, node];
    const last = acc.slice(-1);
    if (!last.length || !isCalling(last[0], "__float_new__")) return [...acc, node];
    return acc.slice(0, acc.length - 1);
  }, [] as readonly InstructionNode[]);
