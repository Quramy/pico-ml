import { createTreeTraverser } from "../structure";
import { factory } from "../wasm";
import { ExpressionNode } from "../syntax";
import { CompilationContext, CompilationResult } from "./types";
import { Context } from "./compiler-context";
import { ModuleBuilder } from "./module-builder";

import { numberLiteral } from "./compile-node/number-literal";
import { boolLiteral } from "./compile-node/bool-literal";
import { emptyList } from "./compile-node/empty-list";
import { unaryExpression } from "./compile-node/unary-expression";
import { binaryExpression } from "./compile-node/binary-expression";
import { listConstructor } from "./compile-node/list-constructor";
import { ifExpression } from "./compile-node/if-expression";
import { matchExpression } from "./compile-node/match-expression";
import { identifier } from "./compile-node/identifier";
import { functionDefinition } from "./compile-node/function-definition";
import { functionApplication } from "./compile-node/function-application";
import { letExpression } from "./compile-node/let-expression";
import { letRecExpression } from "./compile-node/let-rec-expression";

const traverse = createTreeTraverser<ExpressionNode, CompilationContext, CompilationResult>({
  boolLiteral,
  emptyList,
  numberLiteral,
  unaryExpression,
  binaryExpression,
  listConstructor,
  ifExpression,
  matchExpression,
  identifier,
  functionDefinition,
  functionApplication,
  letExpression,
  letRecExpression,
});

export function compile(node: ExpressionNode) {
  const ctx = new Context();
  return traverse(node, ctx).mapValue(instructions => {
    const mainFunc = factory.func(
      factory.funcSig([], [factory.valueType("i32")]),
      ctx.getLocalsMainFn(),
      [...ctx.getInstructions(), ...instructions],
      factory.identifier("main"),
    );
    const mainExport = factory.exportNode("main", factory.exportedFunc(factory.identifier("main")));
    const builder = new ModuleBuilder({
      name: "compiled",
      code: "(module)",
    })
      .addDependencies(ctx.getDependencies())
      .addFields(ctx.matcherDefStack.buildFuncs())
      .addFields(ctx.funcDefStack.buildFuncs())
      .addField(mainFunc)
      .addFields(ctx.funcDefStack.buildTables())
      .addField(mainExport);
    return builder.build();
  });
}
