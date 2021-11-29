import { Parser, use, oneOf, expect, leftAssociate, rightAssociate, loc } from "../parser-util";
import { Scanner } from "./scanner";
import {
  ExpressionNode,
  IntLiteralNode,
  FloatLiteralNode,
  BoolLiteralNode,
  UnaryExpressionNode,
  IfExpressionNode,
  IdentifierNode,
  LetExpressionNode,
  FunctionDefinitionNode,
  LetRecExpressionNode,
  EmptyListNode,
  MatchPatternNode,
  IdPatternNode,
  EmptyListPatternNode,
  WildcardPatternNode,
  MatchClauseNode,
  PatternMatchClauseNode,
  MatchExpressionNode,
  MatchPatternElementNode,
} from "./types";
import { symbolToken, integerToken, keywordToken, variableToken, decimalToken } from "./tokenizer";
import { vec } from "../parser-util/combinator/vec";

/**
 *
 * expr         ::= or | cond | match | func | bind
 * cond         ::= "if" expr "then" expr "else" expr
 * match        ::= "match" expr "wich" pat_clauses
 * pat_clauses  ::= pat_match("|" pat_match)*
 * pat_match    ::= pattern "->" expr
 * pattern      ::= p_prim("::" p_prim)*
 * p_prim       ::= id | "[" "]" | "_"
 * func         ::= "fun" id "->" expr
 * bind         ::= "let"(id id* "=" expr "in" expr | "rec" id (id id* "=" expr | "=" func) "in" expr")
 * or           ::= and("||" (and | cond | match | func | bind))*
 * and          ::= comp("&&" (comp | cond | match | func | bind))*
 * comp         ::= cons(("<" | ">" | "<=" | ">=" | "==" | "!=" | "=" | "<>") (cons | cond | match | func | bind))*
 * cons         ::= add("::" (add | cond | match | func | bind))*
 * add          ::= mul(("+" | "-" | "+." | "-.") (mul | cond | match | func | bind))*
 * mul          ::= prfx(("*" | "/" | "*." | "/.") (prfx | cond | match | func | bind))*
 * prfx         ::= app | ("-" | "-.") app
 * app          ::= prim (prim)*
 * prim         ::= id | bool | int | decimal | empty | group
 * group        ::= "(" expr ")"
 * empty        ::= "[" "]"
 * bool         ::= "true" | "false"
 * decimal      ::= digit+"."digit*
 * int          ::= digit+
 * digit        ::= "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
 * id           ::= regExp([a-zA-Z_][a-zA-Z_0-9']*)
 *
 */
const expr: Parser<ExpressionNode> = oneOf(
  use(() => or),
  use(() => cond),
  use(() => match),
  use(() => func),
  use(() => bind),
);

const bind: Parser<LetExpressionNode | LetRecExpressionNode> = expect(
  keywordToken("let"),
  oneOf(
    expect(
      use(() => id),
      vec(use(() => id)),
      symbolToken("="),
      use(() => expr),
      keywordToken("in"),
      use(() => expr),
    )(
      (id, parameters, tEqual, binding, tIn, exp): LetExpressionNode => ({
        kind: "LetExpression",
        identifier: id,
        binding: parameters.values
          .slice()
          .reverse()
          .reduce(
            (acc, parameter): ExpressionNode => ({
              kind: "FunctionDefinition",
              param: parameter,
              body: acc,
              ...loc(binding),
            }),
            binding,
          ),
        exp,
        ...loc(id, parameters, tEqual, binding, tIn, exp),
      }),
    ),
    expect(
      keywordToken("rec"),
      use(() => id),
      oneOf(
        expect(
          symbolToken("="),
          use(() => func),
        )((_, binding) => binding),
        expect(
          use(() => id),
          vec(use(() => id)),
          symbolToken("="),
          use(() => expr),
        )(
          (firstParam, restParameters, tEqual, binding): FunctionDefinitionNode => ({
            kind: "FunctionDefinition",
            param: firstParam,
            body: restParameters.values
              .slice()
              .reverse()
              .reduce(
                (acc, parameter): ExpressionNode => ({
                  kind: "FunctionDefinition",
                  param: parameter,
                  body: acc,
                  ...loc(binding),
                }),
                binding,
              ),
            ...loc(firstParam, restParameters, tEqual, binding),
          }),
        ),
      ),
      keywordToken("in"),
      use(() => expr),
    )(
      (tRec, id, binding, tIn, exp): LetRecExpressionNode => ({
        kind: "LetRecExpression",
        identifier: id,
        binding,
        exp,
        ...loc(tRec, id, binding, tIn, exp),
      }),
    ),
  ),
)((tLet, letBody) => ({ ...letBody, ...loc(tLet, letBody) }));

const func: Parser<FunctionDefinitionNode> = expect(
  keywordToken("fun"),
  use(() => id),
  symbolToken("->"),
  use(() => expr),
)((tFun, param, tArrow, body) => ({
  kind: "FunctionDefinition",
  param,
  body,
  ...loc(tFun, param, tArrow, body),
}));

const cond: Parser<IfExpressionNode> = expect(
  keywordToken("if"),
  use(() => expr),
  keywordToken("then"),
  use(() => expr),
  keywordToken("else"),
  use(() => expr),
)((tIf, condExpr, tThen, thenExpr, tElse, elseExpr) => ({
  kind: "IfExpression",
  cond: condExpr,
  then: thenExpr,
  else: elseExpr,
  ...loc(tIf, condExpr, tThen, thenExpr, tElse, elseExpr),
}));

const match: Parser<MatchExpressionNode> = expect(
  keywordToken("match"),
  use(() => expr),
  keywordToken("with"),
  use(() => patClauses),
)((tMatch, exp, tWith, matchClause) => ({
  kind: "MatchExpression",
  exp,
  matchClause,
  ...loc(tMatch, exp, tWith, matchClause),
}));

const patClauses: Parser<MatchClauseNode> = rightAssociate(use(() => patMatch))(
  symbolToken("|"),
  use(() => patMatch),
)((left, tBar, clause) => ({
  kind: "MatchOrClause",
  patternMatch: left,
  or: clause,
  ...loc(left, tBar, clause),
}));

const patMatch: Parser<PatternMatchClauseNode> = expect(
  use(() => pattern),
  symbolToken("->"),
  use(() => expr),
)((pattern, tArrow, exp) => ({
  kind: "PatternMatchClause",
  pattern,
  exp,
  ...loc(pattern, tArrow, exp),
}));

const pattern: Parser<MatchPatternNode> = rightAssociate(use(() => pPrim))(
  symbolToken("::"),
  use(() => pPrim),
)((head, tCons, tail) => ({
  kind: "ListConsPattern",
  head,
  tail,
  ...loc(head, tCons, tail),
}));

const pPrim: Parser<MatchPatternElementNode> = oneOf(
  expect(use(() => id))(
    (id): IdPatternNode => ({
      kind: "IdPattern",
      identifier: id,
      ...loc(id),
    }),
  ),
  expect(
    symbolToken("["),
    symbolToken("]"),
  )(
    (t1, t2): EmptyListPatternNode => ({
      kind: "EmptyListPattern",
      ...loc(t1, t2),
    }),
  ),
  expect(symbolToken("_"))(
    (t): WildcardPatternNode => ({
      kind: "WildcardPattern",
      ...loc(t),
    }),
  ),
);

const or: Parser<ExpressionNode> = rightAssociate(use(() => and))(
  symbolToken("||"),
  oneOf(
    use(() => and),
    use(() => cond),
    use(() => match),
    use(() => func),
    use(() => bind),
  ),
)((left, token, right) => ({
  kind: "BinaryExpression",
  op: {
    kind: "Or",
    token,
  },
  left,
  right,
  ...loc(left, token, right),
}));

const and: Parser<ExpressionNode> = rightAssociate(use(() => comp))(
  symbolToken("&&"),
  oneOf(
    use(() => comp),
    use(() => cond),
    use(() => match),
    use(() => func),
    use(() => bind),
  ),
)((left, token, right) => ({
  kind: "BinaryExpression",
  op: {
    kind: "And",
    token,
  },
  left,
  right,
  ...loc(left, token, right),
}));

const comp: Parser<ExpressionNode> = leftAssociate(use(() => cons))(
  oneOf(
    symbolToken("<"),
    symbolToken(">"),
    symbolToken("<="),
    symbolToken(">="),
    symbolToken("="),
    symbolToken("<>"),
    symbolToken("=="),
    symbolToken("!="),
  ),
  oneOf(
    use(() => cons),
    use(() => cond),
    use(() => match),
    use(() => func),
    use(() => bind),
  ),
)((left, token, right) => ({
  kind: "BinaryExpression",
  op: {
    kind:
      token.symbol === "<"
        ? "LessThan"
        : token.symbol === ">"
        ? "GreaterThan"
        : token.symbol === "<="
        ? "LessEqualThan"
        : token.symbol === ">="
        ? "GreaterEqualThan"
        : token.symbol === "="
        ? "Equal"
        : token.symbol === "<>"
        ? "NotEqual"
        : token.symbol === "=="
        ? "PEqual"
        : token.symbol === "!="
        ? "PNotEqual"
        : (undefined as never),
    token,
  },
  left,
  right,
  ...loc(left, token, right),
}));

const cons: Parser<ExpressionNode> = rightAssociate(use(() => add))(
  symbolToken("::"),
  oneOf(
    use(() => add),
    use(() => cond),
    use(() => match),
    use(() => func),
    use(() => bind),
  ),
)((head, token, tail) => ({
  kind: "ListConstructor",
  head,
  tail,
  ...loc(head, token, tail),
}));

const add: Parser<ExpressionNode> = leftAssociate(use(() => mul))(
  oneOf(symbolToken("+"), symbolToken("-"), symbolToken("+."), symbolToken("-.")),
  oneOf(
    use(() => mul),
    use(() => cond),
    use(() => match),
    use(() => func),
    use(() => bind),
  ),
)((left, token, right) => ({
  kind: "BinaryExpression",
  op:
    token.symbol === "+"
      ? { kind: "Add", token }
      : token.symbol === "+."
      ? { kind: "FAdd", token }
      : token.symbol === "-"
      ? { kind: "Sub", token }
      : token.symbol === "-."
      ? { kind: "FSub", token }
      : (null as never),
  left,
  right,
  ...loc(left, token, right),
}));

const mul: Parser<ExpressionNode> = leftAssociate(use(() => prfx))(
  oneOf(symbolToken("*"), symbolToken("*."), symbolToken("/"), symbolToken("/.")),
  oneOf(
    use(() => prfx),
    use(() => cond),
    use(() => match),
    use(() => func),
    use(() => bind),
  ),
)((left, token, right) => ({
  kind: "BinaryExpression",
  op: {
    kind:
      token.symbol === "*"
        ? "Multiply"
        : token.symbol === "*."
        ? "FMultiply"
        : token.symbol === "/"
        ? "Div"
        : token.symbol === "/."
        ? "FDiv"
        : (null as never),
    token,
  },
  left,
  right,
  ...loc(left, token, right),
}));

const prfx: Parser<ExpressionNode> = oneOf(
  use(() => app),
  expect(
    oneOf(symbolToken("-"), symbolToken("-.")),
    use(() => app),
  )(
    (token, expr): UnaryExpressionNode => ({
      kind: "UnaryExpression",
      op:
        token.symbol === "-"
          ? {
              kind: "Minus",
              token: token,
            }
          : {
              kind: "FMinus",
              token: token,
            },
      exp: expr,
      ...loc(token, expr),
    }),
  ),
);

const app: Parser<ExpressionNode> = leftAssociate(use(() => prim))(use(() => prim))((callee, argument) => ({
  kind: "FunctionApplication",
  callee,
  argument,
  ...loc(callee, argument),
}));

const prim: Parser<ExpressionNode> = oneOf(
  use(() => id),
  use(() => num),
  use(() => decimal),
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
)((l, r) => ({
  kind: "EmptyList",
  ...loc(l, r),
}));

const bool: Parser<BoolLiteralNode> = oneOf(
  expect(keywordToken("true"))(
    (t): BoolLiteralNode => ({
      kind: "BoolLiteral",
      value: true,
      ...loc(t),
    }),
  ),
  expect(keywordToken("false"))(
    (t): BoolLiteralNode => ({
      kind: "BoolLiteral",
      value: false,
      ...loc(t),
    }),
  ),
);

const decimal: Parser<FloatLiteralNode> = expect(decimalToken)(token => ({
  kind: "FloatLiteral",
  value: token.value,
  ...loc(token),
}));

const num: Parser<IntLiteralNode> = expect(integerToken)(token => ({
  kind: "IntLiteral",
  value: token.value,
  ...loc(token),
}));

const id: Parser<IdentifierNode> = expect(variableToken)(token => ({
  kind: "Identifier",
  name: token.name,
  ...loc(token),
}));

export function parse(input: string) {
  return expr(new Scanner(input));
}

export function parseMatchPattern(input: string) {
  return pattern(new Scanner(input));
}
