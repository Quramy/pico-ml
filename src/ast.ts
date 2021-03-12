import {
  Token,
  Tokens,
  TokenKind,
  NumberToken,
  BoolToken,
  VariableToken,
} from "./tokenizer";

export interface NumberLiteralNode {
  readonly kind: "NumberLiteral";
  readonly value: number;
}

export interface BoolLiteralNode {
  readonly kind: "BoolLiteral";
  readonly value: boolean;
}

export interface IdentifierNode {
  readonly kind: "Identifier";
  readonly name: string;
}

export interface IfExpressionNode {
  readonly kind: "IfExpression";
  readonly cond: ExpressionNode;
  readonly then: ExpressionNode;
  readonly else: ExpressionNode;
}

export interface BinaryExpressionNode {
  readonly kind: "BinaryExpression";
  readonly op: "Add" | "Multiply" | "Sub" | "LessThan";
  readonly left: ExpressionNode;
  readonly right: ExpressionNode;
}

export interface LetExpressionNode {
  readonly kind: "LetExpression";
  readonly identifier: IdentifierNode;
  readonly binding: ExpressionNode;
  readonly exp: ExpressionNode;
}

export interface FunctionDefinitionNode {
  readonly kind: "FunctionDefinition";
  readonly param: IdentifierNode;
  readonly body: ExpressionNode;
}

export interface LetRecExpressionNode {
  readonly kind: "LetRecExpression";
  readonly identifier: IdentifierNode;
  readonly binding: FunctionDefinitionNode;
  readonly exp: ExpressionNode;
}

export interface FunctionApplicationNode {
  readonly kind: "FunctionApplication";
  readonly callee: ExpressionNode;
  readonly argument: ExpressionNode;
}

export type ExpressionNode =
  | NumberLiteralNode
  | BoolLiteralNode
  | BinaryExpressionNode
  | IfExpressionNode
  | IdentifierNode
  | LetExpressionNode
  | LetRecExpressionNode
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
  return kinds.some((kind) => tokens[0].tokenKind === kind);
}

/**
 *
 * expr   ::= comp | "if" expr "then" expr "else" expr | func | bind
 * bind   ::= "let"(id "=" expr "in" expr | "rec" id "=" func "in" expr)
 * func   ::= "fun" id "->" expr
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
    if (expect(tokens, "Let")) {
      return bind();
    } else if (expect(tokens, "Fun")) {
      return func();
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
        else: elseNode,
      } as IfExpressionNode;
    }
    return comp();
  };

  const bind = () => {
    consume(tokens, "Let");
    if (expect(tokens, "Rec")) {
      consume(tokens, "Rec");
      const id = identifier();
      consume(tokens, "Equal");
      const binding = func();
      consume(tokens, "In");
      const exp = expr();
      return {
        kind: "LetRecExpression",
        identifier: id,
        binding,
        exp,
      } as LetRecExpressionNode;
    }
    const id = identifier();
    consume(tokens, "Equal");
    const binding = expr();
    consume(tokens, "In");
    const exp = expr();
    return {
      kind: "LetExpression",
      identifier: id,
      binding,
      exp,
    } as LetExpressionNode;
  };

  const func = () => {
    consume(tokens, "Fun");
    const id = identifier();
    consume(tokens, "RightArrow");
    const body = expr();
    return {
      kind: "FunctionDefinition",
      param: id,
      body,
    } as FunctionDefinitionNode;
  };

  const comp = () => {
    let node: ExpressionNode = add();
    while (expect(tokens, "LessThan")) {
      consume(tokens, "LessThan");
      node = {
        kind: "BinaryExpression",
        op: "LessThan",
        left: node,
        right: expr(),
      } as BinaryExpressionNode;
    }
    return node;
  };

  const add = () => {
    let node: ExpressionNode = mul();
    while (expect(tokens, "Plus")) {
      consume(tokens, "Plus");
      node = {
        kind: "BinaryExpression",
        op: "Add",
        left: node,
        right: expr(),
      } as BinaryExpressionNode;
    }
    while (expect(tokens, "Minus")) {
      consume(tokens, "Minus");
      node = {
        kind: "BinaryExpression",
        op: "Sub",
        left: node,
        right: expr(),
      } as BinaryExpressionNode;
    }
    return node;
  };

  const mul = () => {
    let node: ExpressionNode = app();
    while (expect(tokens, "Times")) {
      consume(tokens, "Times");
      node = {
        kind: "BinaryExpression",
        op: "Multiply",
        left: node,
        right: expr(),
      } as BinaryExpressionNode;
    }
    return node;
  };

  const app = () => {
    let node: ExpressionNode = prim();
    while (expectPrim()) {
      node = {
        kind: "FunctionApplication",
        callee: node,
        argument: prim(),
      } as FunctionApplicationNode;
    }
    return node;
  };

  const expectPrim = () => {
    return expect(tokens, "LeftParenthesis", "Boolean", "Variable", "Number");
  };

  const prim = () => {
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
      value: t.value,
    } as NumberLiteralNode;
  };

  const bool = () => {
    const t = consume<BoolToken>(tokens, "Boolean");
    return {
      kind: "BoolLiteral",
      value: t.value,
    } as BoolLiteralNode;
  };

  const identifier = () => {
    const t = consume<VariableToken>(tokens, "Variable");
    return {
      kind: "Identifier",
      name: t.value,
    } as IdentifierNode;
  };

  return expr();
}
