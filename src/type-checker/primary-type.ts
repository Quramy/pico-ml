import { ExpressionNode } from "../syntax";
import { PrimaryTypeNode, PrimaryTypeResult, PrimaryTypeContext } from "./types";
import { createRootEnvironment, ParmGenerator } from "./type-environment";
import { createTreeTraverser, TraverserCallbackFnMap } from "../structure/traverser";
import { intLiteral } from "./pt-node/int-literal";
import { floatLiteral } from "./pt-node/float-literal";
import { boolLiteral } from "./pt-node/bool-literal";
import { emptyList } from "./pt-node/empty-list";
import { identifier } from "./pt-node/identifier";
import { listConstructor } from "./pt-node/list-constructor";
import { unaryExpression } from "./pt-node/unary-expression";
import { binaryExpression } from "./pt-node/binary-expression";
import { functionDefinition } from "./pt-node/function-definition";
import { ifExpression } from "./pt-node/if-expression";
import { matchExpression } from "./pt-node/match-expression";
import { letExpression } from "./pt-node/let-expression";
import { letRecExpression } from "./pt-node/let-rec-expression";
import { functionApplication } from "./pt-node/function-application";

type FunctionMap = TraverserCallbackFnMap<ExpressionNode, PrimaryTypeContext, PrimaryTypeResult>;

function wrapWithFunctionAfterTraverse(mapObj: FunctionMap): FunctionMap {
  const keys = Object.keys(mapObj) as (keyof FunctionMap)[];
  const ret = {} as any;
  for (const key of keys) {
    const fn = mapObj[key] as PrimaryTypeNode<any>;
    const wrapped: PrimaryTypeNode<any> = (node, ctx, next) => {
      const result = fn(node, ctx, next);
      if (result.ok && node._nodeId) {
        ctx.ptMap?.set(node._nodeId, result.value.expressionType);
      }
      return result;
    };
    ret[key] = wrapped;
  }
  return ret;
}

export function getPrimaryType(expression: ExpressionNode) {
  return createTreeTraverser<ExpressionNode, PrimaryTypeContext, PrimaryTypeResult>(
    wrapWithFunctionAfterTraverse({
      intLiteral,
      floatLiteral,
      boolLiteral,
      emptyList,
      identifier,
      listConstructor,
      unaryExpression,
      binaryExpression,
      functionDefinition,
      ifExpression,
      matchExpression,
      letExpression,
      letRecExpression,
      functionApplication,
    }),
  )(expression, {
    generator: new ParmGenerator(),
    env: createRootEnvironment(),
    ptMap: new Map(),
  });
}
