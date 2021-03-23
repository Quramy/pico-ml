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
  EmptyListNode,
  MatchExpressionNode,
  ListConstructorNode,
} from "./types";
import { Parser, use, oneOf, expect, leftAssociate, rightAssociate } from "./combinator";
import { symbolToken, numberToken, keywordToken, variableToken } from "./tokenizer";
import { Scanner } from "./scanner";
import { loc } from "./utils";

/**
 *
 * expr   ::= comp | cond | match | func | bind
 * cond   ::= "if" expr "then" expr "else" expr
 * match  ::= "match" expr "with" "[" "]" "->" expr "|" id "::" id -> expr
 * func   ::= "fun" id "->" expr
 * bind   ::= "let"(id "=" expr "in" expr | "rec" id "=" func "in" expr")
 * comp   ::= cons("<" (cons | cond | bind))*
 * cons   ::= add("::" (add | cond | bind))*
 * add    ::= mul(("+"|"-") (mul | cond | bind))*
 * mul    ::= app("*" (app | cond | bind))*
 * app    ::= prim(prim)*
 * prim   ::= id | bool | number | empty | group
 * group  ::= "(" expr ")"
 * empty  ::= "[" "]"
 * bool   ::= "true" | "false"
 * number ::= "0" | "1" | "2" |  ...
 * id     ::= regExp([a-zA-Z$_][a-zA-Z$_0-9]*)
 *
 */
const expr: Parser<ExpressionNode> = oneOf(
  use(() => comp),
  use(() => cond),
  use(() => match),
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

const match: Parser<MatchExpressionNode> = expect(
  keywordToken("match"),
  use(() => expr),
  keywordToken("with"),
  symbolToken("["),
  symbolToken("]"),
  symbolToken("->"),
  use(() => expr),
  symbolToken("|"),
  use(() => id),
  symbolToken("::"),
  use(() => id),
  symbolToken("->"),
  use(() => expr),
)(
  (
    tMatch,
    exp,
    tWith,
    tl,
    tr,
    tArrow,
    emptyClause,
    tPipe,
    leftIdentifier,
    tCons,
    rightIdentifier,
    tArrow2,
    consClause,
  ): MatchExpressionNode => ({
    kind: "MatchExpression",
    exp,
    emptyClause,
    leftIdentifier,
    rightIdentifier,
    consClause,
    ...loc(
      tMatch,
      exp,
      tWith,
      tl,
      tr,
      tArrow,
      emptyClause,
      tPipe,
      leftIdentifier,
      tCons,
      rightIdentifier,
      tArrow2,
      consClause,
    ),
  }),
);

const comp: Parser<ExpressionNode> = expect(use(() => cons))(
  leftAssociate(
    symbolToken("<"),
    oneOf(
      use(() => cons),
      use(() => cond),
      use(() => match),
      use(() => bind),
    ),
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

const cons: Parser<ExpressionNode> = expect(use(() => add))(
  rightAssociate(
    symbolToken("::"),
    oneOf(
      use(() => add),
      use(() => cond),
      use(() => match),
      use(() => bind),
    ),
  )(
    (head, token, tail): ListConstructorNode => ({
      kind: "ListConstructor",
      head,
      tail,
      ...loc(head, token, tail),
    }),
  ),
);

const add: Parser<ExpressionNode> = expect(use(() => mul))(
  leftAssociate(
    oneOf(symbolToken("+"), symbolToken("-")),
    oneOf(
      use(() => mul),
      use(() => cond),
      use(() => match),
      use(() => bind),
    ),
  )(
    (left, token, right): BinaryExpressionNode => ({
      kind: "BinaryExpression",
      op: token.symbol === "+" ? { kind: "Add", token } : { kind: "Sub", token },
      left,
      right,
      ...loc(left, token, right),
    }),
  ),
);

const mul: Parser<ExpressionNode> = expect(use(() => app))(
  leftAssociate(
    symbolToken("*"),
    oneOf(
      use(() => app),
      use(() => cond),
      use(() => match),
      use(() => bind),
    ),
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
  use(() => empty),
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

const empty: Parser<EmptyListNode> = expect(
  symbolToken("["),
  symbolToken("]"),
)(
  (l, r): EmptyListNode => ({
    kind: "EmptyList",
    ...loc(l, r),
  }),
);

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
