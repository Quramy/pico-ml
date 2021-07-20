import { mapValue, ok } from "../../structure";
import { CompileNodeFn } from "../types";
import { factory } from "../../wasm";
import { newEnvInstr } from "../assets/modules/env";
import { getClosureEnvInstr, getClosureFuncBodyInstr } from "./macro/closure";

export const functionApplication: CompileNodeFn<"FunctionApplication"> = (node, ctx, next) => {
  ctx.useEnvironment();
  ctx.useTuple();
  ctx.useLocalVar(factory.localVar(factory.valueType("i32"), factory.identifier("closure_addr")));
  ctx.useLocalVar(factory.localVar(factory.valueType("i32"), factory.identifier("prev_closure_addr")));
  return mapValue(
    next(node.argument, ctx),
    next(node.callee, ctx),
  )((argumentInstr, closureInstr) =>
    ok([
      factory.variableInstr("local.get", [factory.identifier("closure_addr")]),
      factory.variableInstr("local.set", [factory.identifier("prev_closure_addr")]),
      ...closureInstr,
      factory.variableInstr("local.tee", [factory.identifier("closure_addr")]),
      ...getClosureEnvInstr(),

      // Note
      // bind the closure's own  address for recursive call
      factory.variableInstr("local.get", [factory.identifier("closure_addr")]),
      ...newEnvInstr(),

      ...argumentInstr,
      ...newEnvInstr(),

      factory.variableInstr("local.get", [factory.identifier("closure_addr")]),
      ...getClosureFuncBodyInstr(),
      ...ctx.funcDefStack.callInstr(),
      factory.variableInstr("local.get", [factory.identifier("prev_closure_addr")]),
      factory.variableInstr("local.set", [factory.identifier("closure_addr")]),
    ]),
  );
};
