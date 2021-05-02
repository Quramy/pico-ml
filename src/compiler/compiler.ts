import { createTreeTraverser, error } from "../structure";
import { ModuleNode, factory } from "../wasm";
import { ExpressionNode } from "../syntax";
import { CompilationContext, CompilationResult } from "./types";
import { Context } from "./compiler-context";

import { numberLiteral } from "./compile-node/number-literal";
import { boolLiteral } from "./compile-node/bool-literal";
import { unaryExpression } from "./compile-node/unary-expression";
import { binaryExpression } from "./compile-node/binary-expression";

const notImplemented = (node: ExpressionNode) => error({ message: "not implemented", occurence: node });

const traverse = createTreeTraverser<ExpressionNode, CompilationContext, CompilationResult>({
  boolLiteral,
  numberLiteral,
  unaryExpression,
  binaryExpression,
  emptyList: notImplemented,
  functionApplication: notImplemented,
  functionDefinition: notImplemented,
  identifier: notImplemented,
  ifExpression: notImplemented,
  letExpression: notImplemented,
  letRecExpression: notImplemented,
  listConstructor: notImplemented,
  matchExpression: notImplemented,
});

export function compile(node: ExpressionNode) {
  const ctx = new Context();
  return traverse(node, ctx).map(() => {
    const mainFunc = factory.func(
      factory.funcSig([], [factory.valueType("i32")]),
      [],
      ctx.getInstructions(),
      factory.identifier("main"),
    );
    const mainExport = factory.exportNode("main", factory.exportedFunc(factory.identifier("main")));
    const mod: ModuleNode = {
      kind: "Module",
      id: null,
      body: [mainFunc, mainExport],
    };
    return mod;
  });
}
