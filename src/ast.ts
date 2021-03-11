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
  VariableToken,
  FunToken,
  RightArrowToken,
  tokenize
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

export interface FunctionDefinitionNode {
  kind: "FunctionDefinition";
  param: IdentifierNode;
  body: ExpressionNode;
}

export interface FunctionApplicationNode {
  kind: "FunctionApplication";
  callee: ExpressionNode;
  argument: ExpressionNode;
}

export type ExpressionNode =
  | NumberLiteralNode
  | BoolLiteralNode
  | BinaryExpressionNode
  | IfExpressionNode
  | IdentifierNode
  | LetExpressionNode
  | FunctionDefinitionNode
  | FunctionApplicationNode;

function consume<T extends Token = Token, K extends TokenKind = T["tokenKind"]>(
  tokens: Tokens,
  kind: K
) {
  if (tokens[0].tokenKind === kind) {
    const t = tokens.shift() as T;
    return t;
  }
  throw new Error(`Expected ${kind}, but ${tokens[0]?.tokenKind} found.`);
}

function expect(tokens: Tokens, ...kinds: TokenKind[]) {
  if (!tokens.length) return false;
  return kinds.some(kind => tokens[0].tokenKind === kind);
}

/**
 *
 * expr   ::= comp | "if" expr "then" expr "else" expr | "let" id "=" expr "in" expr | "fun" id "->" expr
 * comp   ::= add("<" expr)*
 * add    ::= mul("+" expr | "-" expr)*
 * mul    ::= app("*" expr)*
 * app    ::= prim(prim)*
 * prim   ::= id | bool | number | "(" expr ")"
 * number ::= "0" | "1" | "2" |  ...
 * id     ::= regExp([a-zA-Z$_][a-zA-Z$_0-9]*)
 * bool   ::= "true" | "false"
 *
 */
export function createTree(tokens: Tokens): ExpressionNode {
  const expr = (): ExpressionNode => {
    if (expect(tokens, "Fun")) {
      consume(tokens, "Fun");
      const id = identifier();
      consume(tokens, "RightArrow");
      const body = expr();
      return {
        kind: "FunctionDefinition",
        param: id,
        body
      } as FunctionDefinitionNode;
    } else if (expect(tokens, "Let")) {
      consume(tokens, "Let");
      const id = identifier();
      consume(tokens, "Equal");
      const binding = expr();
      consume(tokens, "In");
      const exp = expr();
      return {
        kind: "LetExpression",
        identifier: id,
        binding,
        exp
      } as LetExpressionNode;
    } else if (expect(tokens, "If")) {
      consume(tokens, "If");
      const condition = expr();
      consume(tokens, "Then");
      const thenNode = expr();
      consume(tokens, "Else");
      const elseNode = expr();
      return {
        kind: "IfExpression",
        cond: condition,
        then: thenNode,
        else: elseNode
      } as IfExpressionNode;
    }
    return comp();
  };

  const comp = (): ExpressionNode => {
    let node: ExpressionNode = add();
    while (expect(tokens, "LessThan")) {
      consume(tokens, "LessThan");
      node = {
        kind: "BinaryExpression",
        op: "LessThan",
        left: node,
        right: expr()
      } as BinaryExpressionNode;
    }
    return node;
  };

  const add = (): ExpressionNode => {
    let node: ExpressionNode = mul();
    while (expect(tokens, "Plus")) {
      consume(tokens, "Plus");
      node = {
        kind: "BinaryExpression",
        op: "Add",
        left: node,
        right: expr()
      } as BinaryExpressionNode;
    }
    while (expect(tokens, "Minus")) {
      consume(tokens, "Minus");
      node = {
        kind: "BinaryExpression",
        op: "Sub",
        left: node,
        right: expr()
      } as BinaryExpressionNode;
    }
    return node;
  };

  const mul = (): ExpressionNode => {
    let node: ExpressionNode = app();
    while (expect(tokens, "Times")) {
      consume(tokens, "Times");
      node = {
        kind: "BinaryExpression",
        op: "Multiply",
        left: node,
        right: expr()
      } as BinaryExpressionNode;
    }
    return node;
  };

  const app = (): ExpressionNode => {
    let node: ExpressionNode = prim();
    while (expectPrim()) {
      node = {
        kind: "FunctionApplication",
        callee: node,
        argument: prim()
      } as FunctionApplicationNode;
    }
    return node;
  };

  const expectPrim = () => {
    return expect(tokens, "LeftParenthesis", "Boolean", "Variable", "Number");
  };

  const prim = (): ExpressionNode => {
    if (expect(tokens, "LeftParenthesis")) {
      consume(tokens, "LeftParenthesis");
      const node = expr();
      consume(tokens, "RightParenthesis");
      return node;
    }
    if (expect(tokens, "Boolean")) {
      return bool();
    }
    if (expect(tokens, "Number")) {
      return number();
    }
    if (expect(tokens, "Variable")) {
      return identifier();
    }
    console.error(tokens);
    throw new Error("invalid token");
  };

  const number = () => {
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
