import { factory } from "../../../wasm";
import { getEnvAddrInstr } from "../../assets/modules/env";
import { newTripleInstr } from "../../assets/modules/tuple";
import { CompilationContext } from "../../types";

export function newClosureInstr(ctx: CompilationContext) {
  ctx.useEnvironment();
  ctx.useTuple();
  return (funcIndex: number, recursive = false) => {
    // Note
    // Function closure is represented as a tuple:
    //   (recursive_flag, env_address, function_index_of_table_elements)
    return [
      factory.numericInstr("i32.const", [factory.int32(recursive ? 1 : 0)]),
      ...getEnvAddrInstr(),
      factory.numericInstr("i32.const", [factory.int32(funcIndex)]),
      ...newTripleInstr(),
    ];
  };
}
