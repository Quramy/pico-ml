import { createTreeTraverser, error } from "../structure";
import { factory } from "../wasm";
import { ExpressionNode } from "../syntax";
import { CompilationContext, CompilationResult } from "./types";
import { Context } from "./compiler-context";
import { ModuleBuilder } from "./moduel-builder";

import { numberLiteral } from "./compile-node/number-literal";
import { boolLiteral } from "./compile-node/bool-literal";
import { unaryExpression } from "./compile-node/unary-expression";
import { binaryExpression } from "./compile-node/binary-expression";
import { identifier } from "./compile-node/identifier";
import { letExpression } from "./compile-node/let-expression";

const notImplemented = (node: ExpressionNode) => error({ message: "not implemented", occurence: node });

const traverse = createTreeTraverser<ExpressionNode, CompilationContext, CompilationResult>({
  identifier,
  boolLiteral,
  numberLiteral,
  unaryExpression,
  binaryExpression,
  letExpression,
  emptyList: notImplemented,
  functionApplication: notImplemented,
  functionDefinition: notImplemented,
  ifExpression: notImplemented,
  letRecExpression: notImplemented,
  listConstructor: notImplemented,
  matchExpression: notImplemented,
});

export function compile(node: ExpressionNode) {
  const ctx = new Context();
  return traverse(node, ctx).mapValue(() => {
    const mainFunc = factory.func(
      factory.funcSig([], [factory.valueType("i32")]),
      ctx.getLocalsMainFn(),
      ctx.getInstructions(),
      factory.identifier("main"),
    );
    const mainExport = factory.exportNode("main", factory.exportedFunc(factory.identifier("main")));
    const builder = new ModuleBuilder({
      name: "compiled",
      code: "(module)",
    })
      .addDependencies(ctx.getDependencies())
      .addField(mainFunc)
      .addField(mainExport);
    return builder.build();
  });
}
