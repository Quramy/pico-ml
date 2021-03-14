import {
  ExpressionNode,
  NumberLiteralNode,
  BinaryExpressionNode,
  BoolLiteralNode,
  IfExpressionNode,
  IdentifierNode,
  LetExpressionNode,
  FunctionDefinitionNode,
  FunctionApplicationNode,
  LetRecExpressionNode,
} from "./types";
import { Parser, use, oneOf, expect, leftAssociate } from "./combinator";
import { symbolToken, numberToken, keywordToken, variableToken } from "./tokenizer";
import { Scanner } from "./scanner";
import { loc } from "./utils";

/**
 *
 * expr   ::= comp | cond | func | bind
 * cond   ::= "if" expr "then" expr "else" expr
 * bind   ::= "let"(id "=" expr "in" expr | "rec" id "=" func "in" expr")
 * func   ::= "fun" id "->" expr
 * comp   ::= add("<" expr)*
 * add    ::= mul(("+"|"-") expr)*
 * mul    ::= app("*" expr)*
 * app    ::= prim(prim)*
 * prim   ::= id | bool | number | group
 * group  ::= "(" expr ")"
 * bool   ::= "true" | "false"
 * number ::= "0" | "1" | "2" |  ...
 * id     ::= regExp([a-zA-Z$_][a-zA-Z$_0-9]*)
 *
 */
const expr: Parser<ExpressionNode> = oneOf(
  use(() => comp),
  use(() => cond),
  use(() => func),
  use(() => bind),
);

const bind: Parser<LetExpressionNode | LetRecExpressionNode> = expect(keywordToken("let"))((tLet, scanner) =>
  oneOf(
    expect(
      use(() => id),
      symbolToken("="),
      use(() => expr),
      keywordToken("in"),
      use(() => expr),
    )(
      (id, tEqual, binding, tIn, exp): LetExpressionNode => ({
        kind: "LetExpression",
        identifier: id,
        binding,
        exp,
        ...loc(tLet, id, tEqual, binding, tIn, exp),
      }),
    ),
    expect(
      keywordToken("rec"),
      use(() => id),
      symbolToken("="),
      use(() => func),
      keywordToken("in"),
      use(() => expr),
    )(
      (tRec, id, tEqual, binding, tIn, exp): LetRecExpressionNode => ({
        kind: "LetRecExpression",
        identifier: id,
        binding,
        exp,
        ...loc(tLet, tRec, id, tEqual, binding, tIn, exp),
      }),
    ),
  )(scanner),
);

const func: Parser<FunctionDefinitionNode> = expect(
  keywordToken("fun"),
  use(() => id),
  symbolToken("->"),
  use(() => expr),
)(
  (tFun, param, tArrow, body): FunctionDefinitionNode => ({
    kind: "FunctionDefinition",
    param,
    body,
    ...loc(tFun, param, tArrow, body),
  }),
);

const cond: Parser<IfExpressionNode> = expect(
  keywordToken("if"),
  use(() => expr),
  keywordToken("then"),
  use(() => expr),
  keywordToken("else"),
  use(() => expr),
)(
  (tIf, condExpr, tThen, thenExpr, tElse, elseExpr) =>
    ({
      kind: "IfExpression",
      cond: condExpr,
      then: thenExpr,
      else: elseExpr,
      ...loc(tIf, condExpr, tThen, thenExpr, tElse, elseExpr),
    } as IfExpressionNode),
);

const comp: Parser<ExpressionNode> = expect(use(() => add))(
  leftAssociate(
    symbolToken("<"),
    use(() => expr),
  )(
    (left, token, right): BinaryExpressionNode => ({
      kind: "BinaryExpression",
      op: { kind: "LessThan", token },
      left,
      right,
      ...loc(left, token, right),
    }),
  ),
);

const add: Parser<ExpressionNode> = expect(use(() => mul))(
  leftAssociate(
    oneOf(symbolToken("+"), symbolToken("-")),
    use(() => expr),
  )(
    (left, token, right): BinaryExpressionNode => ({
      kind: "BinaryExpression",
      op: token.tokenKind === "Plus" ? { kind: "Add", token } : { kind: "Sub", token },
      left,
      right,
      ...loc(left, token, right),
    }),
  ),
);

const mul: Parser<ExpressionNode> = expect(use(() => app))(
  leftAssociate(
    symbolToken("*"),
    use(() => expr),
  )(
    (left, token, right): BinaryExpressionNode => ({
      kind: "BinaryExpression",
      op: {
        kind: "Multiply",
        token,
      },
      left,
      right,
      ...loc(left, token, right),
    }),
  ),
);

const app: Parser<ExpressionNode> = expect(use(() => prim))(
  leftAssociate(use(() => prim))(
    (callee, argument): FunctionApplicationNode => ({
      kind: "FunctionApplication",
      callee,
      argument,
      ...loc(callee, argument),
    }),
  ),
);

const prim: Parser<ExpressionNode> = oneOf(
  use(() => id),
  use(() => num),
  use(() => bool),
  use(() => group),
);

const group: Parser<ExpressionNode> = expect(
  symbolToken("("),
  use(() => expr),
  symbolToken(")"),
)((lp, node, rp) => ({
  ...node,
  ...loc(lp, node, rp),
}));

const bool: Parser<BoolLiteralNode> = oneOf(
  expect(keywordToken("true"))(
    ({ loc }): BoolLiteralNode => ({
      kind: "BoolLiteral",
      value: true,
      loc,
    }),
  ),
  expect(keywordToken("false"))(
    ({ loc }): BoolLiteralNode => ({
      kind: "BoolLiteral",
      value: false,
      loc,
    }),
  ),
);

const num: Parser<NumberLiteralNode> = expect(numberToken)(
  ({ value, loc }): NumberLiteralNode => ({
    kind: "NumberLiteral",
    value,
    loc,
  }),
);

const id: Parser<IdentifierNode> = expect(variableToken)(
  ({ name, loc }): IdentifierNode => ({
    kind: "Identifier",
    name,
    loc,
  }),
);

export function parse(input: string) {
  return expr(new Scanner(input));
}
