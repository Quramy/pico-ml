import { factory } from "../../../wasm";
import { getEnvAddrInstr } from "../../assets/modules/env";
import { newTupleInstr, getTupleValueInstr } from "../../assets/modules/tuple";
import { CompilationContext } from "../../types";

export function newClosureInstr(ctx: CompilationContext) {
  ctx.useEnvironment();
  ctx.useTuple();
  return (funcIndex: number) => {
    return [
      // Note
      // Function closure is represented as a tuple:
      //   (recursive_flag, env_address, function_index_of_table_elements)
      ...getEnvAddrInstr(),
      factory.int32NumericInstr("i32.const", [factory.int32(funcIndex)]),
      ...newTupleInstr(),

      // Note:
      // We should add the following tag to LSB 4-bits of the closure address.
      // [1110] = 0xd
      factory.int32NumericInstr("i32.const", [factory.int32(4)]),
      factory.int32NumericInstr("i32.shl"),
      factory.int32NumericInstr("i32.const", [factory.int32(14)]),
      factory.int32NumericInstr("i32.or"),
    ];
  };
}

export function getClosureEnvInstr() {
  return [
    factory.int32NumericInstr("i32.const", [factory.int32(4)]),
    factory.int32NumericInstr("i32.shr_u"),
    ...getTupleValueInstr(0), // env for the closure is stored as the 1st value
  ];
}

export function getClosureFuncBodyInstr() {
  return [
    factory.int32NumericInstr("i32.const", [factory.int32(4)]),
    factory.int32NumericInstr("i32.shr_u"),
    ...getTupleValueInstr(1), // function body index for the closure is stored as the 2nd value
  ];
}
