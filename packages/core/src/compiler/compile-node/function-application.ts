import { mapValue, ok } from "../../structure";
import { CompileNodeFn } from "../types";
import { wat } from "../../wasm";
import { newEnvInstr } from "../assets/modules/env";
import { getClosureEnvInstr, getClosureFuncBodyInstr } from "./macro/closure";

export const functionApplication: CompileNodeFn<"FunctionApplication"> = (node, ctx, next) => {
  ctx.useEnvironment();
  ctx.useLocalVar(wat.localVar`(local $closure_addr i32)`());
  ctx.useLocalVar(wat.localVar`(local $prev_closure_addr i32)`());
  return mapValue(
    next(node.argument, ctx),
    next(node.callee, ctx),
  )((argumentInstr, closureInstr) =>
    ok(
      wat.instructions`
        local.get $closure_addr
        local.set $prev_closure_addr
        ${() => closureInstr}
        local.tee $closure_addr
        ${getClosureEnvInstr}

        ;; Note
        ;; bind the closure's own address for recursive call
        local.get $closure_addr
        ${newEnvInstr}

        ${() => argumentInstr}
        ${newEnvInstr}

        local.get $closure_addr
        ${getClosureFuncBodyInstr}
        ${ctx.funcDefStack.callInstr}
        local.get $prev_closure_addr
        local.set $closure_addr
      `(),
    ),
  );
};
