import {
  Token,
  Tokens,
  TokenKind,
  NumberToken,
  LeftParenthesisToken,
  RightParenthesisToken,
  PlusToken,
  TimesToken,
  MinusToken,
  IfToken,
  ThenToken,
  ElseToken,
  LessThanToken,
  BoolToken,
  LetToken,
  EqualToken,
  InToken,
  VariableToken
} from "./tokenizer";

export interface NumberLiteralNode {
  kind: "NumberLiteral";
  value: number;
}

export interface BoolLiteralNode {
  kind: "BoolLiteral";
  value: boolean;
}

export interface IdentifierNode {
  kind: "Identifier";
  name: string;
}

export interface IfExpressionNode {
  kind: "IfExpression";
  cond: ExpressionNode;
  then: ExpressionNode;
  else: ExpressionNode;
}

export interface BinaryExpressionNode {
  kind: "BinaryExpression";
  op: "Add" | "Multiply" | "Sub" | "LessThan";
  left: ExpressionNode;
  right: ExpressionNode;
}

export interface LetExpressionNode {
  kind: "LetExpression";
  identifier: IdentifierNode;
  binding: ExpressionNode;
  exp: ExpressionNode;
}

export type ExpressionNode =
  | NumberLiteralNode
  | BoolLiteralNode
  | BinaryExpressionNode
  | IfExpressionNode
  | IdentifierNode
  | LetExpressionNode;

function consume<T extends Token, K extends TokenKind = T["tokenKind"]>(
  tokens: Tokens,
  kind: K
) {
  if (tokens[0].tokenKind === kind) {
    const t = tokens.shift() as T;
    return t;
  }
  throw new Error(`Expected ${kind}, but ${tokens[0]?.tokenKind} found.`);
}

function expect(tokens: Tokens, kind: TokenKind) {
  if (!tokens.length) return false;
  return tokens[0].tokenKind === kind;
}

/**
 *
 * expr   := cond | "if" expr "then" expr "else" expr | "let" id "=" expr "in" expr
 * cond   := add("<" add)*
 * add    := mul("+" mul | "-" mul)*
 * mul    := prim("*" prim)*
 * prim   := "(" expr ")" | number | bool | id
 * number := "-"? nat
 * id     := regExp([a-zA-Z$_][a-zA-Z$_0-9]*)
 * nat    := "0" | "1" | "2" |  ...
 * bool   := "true" | "false"
 *
 */
export function createTree(tokens: Tokens): ExpressionNode {
  const expr = (): ExpressionNode => {
    if (expect(tokens, "Let")) {
      consume<LetToken>(tokens, "Let");
      const id = identifier();
      consume<EqualToken>(tokens, "Equal");
      const binding = expr();
      consume<InToken>(tokens, "In");
      const exp = expr();
      return {
        kind: "LetExpression",
        identifier: id,
        binding,
        exp
      } as LetExpressionNode;
    } else if (expect(tokens, "If")) {
      consume<IfToken>(tokens, "If");
      const condition = expr();
      consume<ThenToken>(tokens, "Then");
      const thenNode = expr();
      consume<ElseToken>(tokens, "Else");
      const elseNode = expr();
      return {
        kind: "IfExpression",
        cond: condition,
        then: thenNode,
        else: elseNode
      } as IfExpressionNode;
    }
    return cond();
  };

  const cond = (): ExpressionNode => {
    let node: ExpressionNode = add();
    while (expect(tokens, "LessThan")) {
      consume<LessThanToken>(tokens, "LessThan");
      node = {
        kind: "BinaryExpression",
        op: "LessThan",
        left: node,
        right: add()
      } as BinaryExpressionNode;
    }
    return node;
  };

  const add = (): ExpressionNode => {
    let node: ExpressionNode = mul();
    while (expect(tokens, "Plus")) {
      consume<PlusToken>(tokens, "Plus");
      node = {
        kind: "BinaryExpression",
        op: "Add",
        left: node,
        right: mul()
      } as BinaryExpressionNode;
    }
    while (expect(tokens, "Minus")) {
      consume<MinusToken>(tokens, "Minus");
      node = {
        kind: "BinaryExpression",
        op: "Sub",
        left: node,
        right: mul()
      } as BinaryExpressionNode;
    }
    return node;
  };

  const mul = (): ExpressionNode => {
    let node: ExpressionNode = prim();
    while (expect(tokens, "Times")) {
      consume<TimesToken>(tokens, "Times");
      node = {
        kind: "BinaryExpression",
        op: "Multiply",
        left: node,
        right: prim()
      } as BinaryExpressionNode;
    }
    return node;
  };

  const prim = (): ExpressionNode => {
    if (expect(tokens, "LeftParenthesis")) {
      consume<LeftParenthesisToken>(tokens, "LeftParenthesis");
      const node = expr();
      consume<RightParenthesisToken>(tokens, "RightParenthesis");
      return node;
    }
    if (expect(tokens, "Boolean")) {
      return bool();
    }
    if (expect(tokens, "Number") || expect(tokens, "Minus")) {
      return number();
    }
    if (expect(tokens, "Variable")) {
      return identifier();
    }
    console.error(tokens);
    throw new Error("invalid token");
  };

  const number = () => {
    if (expect(tokens, "Minus")) {
      consume<MinusToken>(tokens, "Minus");
      const n = nat();
      return {
        kind: "NumberLiteral",
        value: -1 * n.value
      } as NumberLiteralNode;
    }
    return nat();
  };

  const nat = () => {
    const t = consume<NumberToken>(tokens, "Number");
    return {
      kind: "NumberLiteral",
      value: t.value
    } as NumberLiteralNode;
  };

  const bool = () => {
    const t = consume<BoolToken>(tokens, "Boolean");
    return {
      kind: "BoolLiteral",
      value: t.value
    } as BoolLiteralNode;
  };

  const identifier = () => {
    const t = consume<VariableToken>(tokens, "Variable");
    return {
      kind: "Identifier",
      name: t.value
    } as IdentifierNode;
  };

  return expr();
}
