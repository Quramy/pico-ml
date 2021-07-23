import { createTreeTraverser } from "../structure";
import { factory } from "../wasm";
import { ExpressionNode } from "../syntax";

import { CompilationContext, CompilationResult, CompiledModuleResult, CompileNodeOptions } from "./types";
import { Context } from "./compiler-context";
import { ModuleBuilder } from "./module-builder";

import { intLiteral } from "./compile-node/int-literal";
import { floatLiteral } from "./compile-node/float-literal";
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

import { reduceFloatInstructionsFactory } from "./module-optimizer/reduce-float-instructions";

const traverse = createTreeTraverser<ExpressionNode, CompilationContext<CompileNodeOptions>, CompilationResult>({
  boolLiteral,
  emptyList,
  intLiteral,
  floatLiteral,
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

export function compile(
  node: ExpressionNode,
  options: CompileNodeOptions = {
    dispatchUsingInferredType: false,
    reduceFloatInstructions: false,
    typeValueMap: new Map(),
  },
): CompiledModuleResult {
  const ctx = new Context(options);
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
    return builder
      .build()
      .map(moduleNode => (options.reduceFloatInstructions ? reduceFloatInstructionsFactory()(moduleNode) : moduleNode))
      .error(err => ({ ...err, occurence: undefined }));
  });
}
