import { wat } from "../../../wasm";
import { getEnvAddrInstr } from "../../assets/modules/env";
import { newTupleInstr, getTupleValueInstr } from "../../assets/modules/tuple";
import { CompilationContext } from "../../types";

export function newClosureInstr(ctx: CompilationContext) {
  ctx.useEnvironment();
  ctx.useTuple();
  return (funcIndex: number) =>
    wat.instructions`
      ;; Note
      ;; Function closure is represented as a tuple:
      ;;   (recursive_flag, env_address, function_index_of_table_elements)
      ${getEnvAddrInstr}
      i32.const ${funcIndex}
      ${newTupleInstr}

      ;; Note:
      ;; We should add the following tag to LSB 4-bits of the closure address.
      ;; [1110] = 0xd
      i32.const 4
      i32.shl
      i32.const 14
      i32.or
    `();
}

export const getClosureEnvInstr = wat.instructions`
  i32.const 4
  i32.shr_u
  ${() => getTupleValueInstr(0)} ;; env for the closure is stored as the 1st value
`;

export const getClosureFuncBodyInstr = wat.instructions`
  i32.const 4
  i32.shr_u
  ${() => getTupleValueInstr(1)} ;; function body index for the closure is stored as the 2nd value
`;
