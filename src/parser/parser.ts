import { ok } from "../structure";
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
  ListConstructorNode,
  MatchPatternNode,
  IdPatternNode,
  ListConsPatternNode,
  EmptyListPatternNode,
  WildcardPatternNode,
  MatchClauseNode,
  PatternMatchClauseNode,
  MatchOrClauseNode,
  MatchExpressionNode,
  MatchPatternElementNode,
} from "./types";
import { Parser, ParseResult, use, oneOf, expect, leftAssociate, rightAssociate } from "./combinator";
import { symbolToken, numberToken, keywordToken, variableToken } from "./tokenizer";
import { Scanner } from "./scanner";
import { loc } from "./utils";

/**
 *
 * expr         ::= comp | cond | match | func | bind
 * cond         ::= "if" expr "then" expr "else" expr
 * match        ::= "match" expr "wich" pat_clauses
 * pat_clauses  ::= pat_match("|" pat_match)*
 * pat_match    ::= pattern "->" expr
 * pattern      ::= p_prim("::" p_prim)*
 * p_prim       ::= id | "[" "]" | "_"
 * func         ::= "fun" id "->" expr
 * bind         ::= "let"(id "=" expr "in" expr | "rec" id "=" func "in" expr")
 * comp         ::= cons("<" (cons | cond | bind))*
 * cons         ::= add("::" (add | cond | bind))*
 * add          ::= mul(("+"|"-") (mul | cond | bind))*
 * mul          ::= app("*" (app | cond | bind))*
 * app          ::= prim(prim)*
 * prim         ::= id | bool | number | empty | group
 * group        ::= "(" expr ")"
 * empty        ::= "[" "]"
 * bool         ::= "true" | "false"
 * number       ::= "0" | "1" | "2" |  ...
 * id           ::= regExp([a-zA-Z_][a-zA-Z_0-9']*)
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
      (id, tEqual, binding, tIn, exp): ParseResult<LetExpressionNode> =>
        ok({
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
      (tRec, id, tEqual, binding, tIn, exp): ParseResult<LetRecExpressionNode> =>
        ok({
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
  (tFun, param, tArrow, body): ParseResult<FunctionDefinitionNode> =>
    ok({
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
  (tIf, condExpr, tThen, thenExpr, tElse, elseExpr): ParseResult<IfExpressionNode> =>
    ok({
      kind: "IfExpression",
      cond: condExpr,
      then: thenExpr,
      else: elseExpr,
      ...loc(tIf, condExpr, tThen, thenExpr, tElse, elseExpr),
    }),
);

const match: Parser<MatchExpressionNode> = expect(
  keywordToken("match"),
  use(() => expr),
  keywordToken("with"),
  use(() => patClauses),
)(
  (tMatch, exp, tWith, matchClause): ParseResult<MatchExpressionNode> =>
    ok({
      kind: "MatchExpression",
      exp,
      matchClause,
      ...loc(tMatch, exp, tWith, matchClause),
    }),
);

const patClauses: Parser<MatchClauseNode> = expect(use(() => patMatch))(
  rightAssociate(
    symbolToken("|"),
    use(() => patMatch),
  )(
    (left, tBar, clause): MatchOrClauseNode => ({
      kind: "MatchOrClause",
      patternMatch: left,
      or: clause,
      ...loc(left, tBar, clause),
    }),
  ),
);

const patMatch: Parser<PatternMatchClauseNode> = expect(
  use(() => pattern),
  symbolToken("->"),
  use(() => expr),
)(
  (pattern, tArrow, exp): ParseResult<PatternMatchClauseNode> =>
    ok({
      kind: "PatternMatchClause",
      pattern,
      exp,
      ...loc(pattern, tArrow, exp),
    }),
);

const pattern: Parser<MatchPatternNode> = expect(use(() => pPrim))(
  rightAssociate(
    symbolToken("::"),
    use(() => pPrim),
  )(
    (head, tCons, tail): ListConsPatternNode => ({
      kind: "ListConsPattern",
      head,
      tail,
      ...loc(head, tCons, tail),
    }),
  ),
);

const pPrim: Parser<MatchPatternElementNode> = oneOf(
  expect(use(() => id))(
    (id): ParseResult<IdPatternNode> =>
      ok({
        kind: "IdPattern",
        identifier: id,
        ...loc(id),
      }),
  ),
  expect(
    symbolToken("["),
    symbolToken("]"),
  )(
    (t1, t2): ParseResult<EmptyListPatternNode> =>
      ok({
        kind: "EmptyListPattern",
        ...loc(t1, t2),
      }),
  ),
  expect(symbolToken("_"))(
    (t): ParseResult<WildcardPatternNode> =>
      ok({
        kind: "WildcardPattern",
        ...loc(t),
      }),
  ),
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
)((lp, node, rp) =>
  ok({
    ...node,
    ...loc(lp, node, rp),
  }),
);

const empty: Parser<EmptyListNode> = expect(
  symbolToken("["),
  symbolToken("]"),
)(
  (l, r): ParseResult<EmptyListNode> =>
    ok({
      kind: "EmptyList",
      ...loc(l, r),
    }),
);

const bool: Parser<BoolLiteralNode> = oneOf(
  expect(keywordToken("true"))(
    ({ loc }): ParseResult<BoolLiteralNode> =>
      ok({
        kind: "BoolLiteral",
        value: true,
        loc,
      }),
  ),
  expect(keywordToken("false"))(
    ({ loc }): ParseResult<BoolLiteralNode> =>
      ok({
        kind: "BoolLiteral",
        value: false,
        loc,
      }),
  ),
);

const num: Parser<NumberLiteralNode> = expect(numberToken)(
  ({ value, loc }): ParseResult<NumberLiteralNode> =>
    ok({
      kind: "NumberLiteral",
      value,
      loc,
    }),
);

const id: Parser<IdentifierNode> = expect(variableToken)(
  ({ name, loc }): ParseResult<IdentifierNode> =>
    ok({
      kind: "Identifier",
      name,
      loc,
    }),
);

export function parse(input: string) {
  return expr(new Scanner(input));
}

export function parseMatchPattern(input: string) {
  return pattern(new Scanner(input));
}
