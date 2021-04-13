import { createTreeTraverser } from "../structure";
import { ExpressionNode } from "../syntax";
import { Environment, EvaluationResult } from "./types";
import { createRootEnvironment } from "./environment";

import { literal } from "./evaluate-node/literal";
import { emptyList } from "./evaluate-node/empty-list";
import { identifier } from "./evaluate-node/identifer";
import { functionDefinition } from "./evaluate-node/function-definition";
import { unaryExpression } from "./evaluate-node/unary-expression";
import { binaryExpression } from "./evaluate-node/binay-expression";
import { listConstructor } from "./evaluate-node/list-constructor";
import { ifExpression } from "./evaluate-node/if-expression";
import { matchExpression } from "./evaluate-node/match-expression";
import { letExpression } from "./evaluate-node/let-expression";
import { letRecExpression } from "./evaluate-node/let-rec-expression";
import { functionApplication } from "./evaluate-node/function-application";

export function evaluate(expression: ExpressionNode) {
  return createTreeTraverser<ExpressionNode, Environment, EvaluationResult>({
    boolLiteral: literal,
    numberLiteral: literal,
    emptyList,
    identifier,
    functionDefinition,
    unaryExpression,
    binaryExpression,
    listConstructor,
    ifExpression,
    matchExpression,
    letExpression,
    letRecExpression,
    functionApplication,
  })(expression, createRootEnvironment());
}
