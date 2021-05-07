import { ExpressionNode } from "../syntax";
import { PrimaryTypeResult, PrimaryTypeContext } from "./types";
import { createRootEnvironment, ParmGenerator } from "./type-environment";
import { createTreeTraverser } from "../structure/traverser";
import { intLiteral } from "./pt-node/int-literal";
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

export function getPrimaryType(expression: ExpressionNode) {
  return createTreeTraverser<ExpressionNode, PrimaryTypeContext, PrimaryTypeResult>({
    intLiteral,
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
  })(expression, {
    generator: new ParmGenerator(),
    env: createRootEnvironment(),
  });
}
