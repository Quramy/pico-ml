import { mapValue, ok } from "../../structure";
import { CompileNodeFn } from "../types";
import { factory } from "../../wasm";
import { newEnvInstr } from "../assets/modules/env";
import { getTupleValueInstr } from "../assets/modules/tuple";

export const functionApplication: CompileNodeFn<"FunctionApplication"> = (node, ctx, next) => {
  ctx.useEnvironment();
  ctx.useTuple();
  ctx.useLocalVar(factory.localVar(factory.valueType("i32"), factory.identifier("closure_addr")));
  return mapValue(
    next(node.argument, ctx),
    next(node.callee, ctx),
  )((argumentInstr, closureInstr) =>
    ok([
      ...closureInstr,
      factory.variableInstr("local.tee", [factory.identifier("closure_addr")]),
      ...getTupleValueInstr(0), // env for the closure is stored as the 1st value
      ...argumentInstr,
      ...newEnvInstr(),
      factory.variableInstr("local.get", [factory.identifier("closure_addr")]),
      ...getTupleValueInstr(1), // function body index for the closure is stored as the 2nd value
      ...ctx.funcDefStack.callInstr(),
    ]),
  );
};
