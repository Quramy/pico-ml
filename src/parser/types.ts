export interface Position {
  readonly loc?: {
    readonly pos: number;
    readonly end: number;
  };
}

export type Symbols = ["(", ")", "+", "-", "*", "<", "=", "->"];
export type ReservedWords = ["if", "then", "else", "let", "in", "fun", "rec", "true", "false"];

export interface TokenBase<T extends string> extends Position {
  readonly tokenKind: T;
}

export interface LeftParenthesisToken extends TokenBase<"LeftParenthesis"> {}
export interface RightParenthesisToken extends TokenBase<"RightParenthesis"> {}
export interface PlusToken extends TokenBase<"Plus"> {}
export interface MinusToken extends TokenBase<"Minus"> {}
export interface TimesToken extends TokenBase<"Times"> {}
export interface LessThanToken extends TokenBase<"LessThan"> {}
export interface EqualToken extends TokenBase<"Equal"> {}
export interface RightArrowToken extends TokenBase<"RightArrow"> {}
export interface KeywordToken extends TokenBase<"Keyword"> {
  readonly keyword: ReservedWords[number];
}
export interface VariableToken extends TokenBase<"Variable"> {
  name: string;
}

export interface NumberToken extends TokenBase<"Number"> {
  readonly value: number;
}

export type SymbolToken =
  | LeftParenthesisToken
  | RightParenthesisToken
  | PlusToken
  | MinusToken
  | TimesToken
  | LessThanToken
  | EqualToken
  | RightArrowToken;

type SymbolTokensMapBase = {
  readonly [s in Symbols[number]]: SymbolToken;
};

export interface SymbolTokensMap extends SymbolTokensMapBase {
  readonly "(": LeftParenthesisToken;
  readonly ")": RightParenthesisToken;
  readonly "+": PlusToken;
  readonly "-": MinusToken;
  readonly "*": TimesToken;
  readonly "<": LessThanToken;
  readonly "=": EqualToken;
  readonly "->": RightArrowToken;
}

export type Token = SymbolToken | KeywordToken | NumberToken | VariableToken;

export interface AddOperation {
  readonly kind: "Add";
  readonly token: PlusToken;
}

export interface SubOperation {
  readonly kind: "Sub";
  readonly token: MinusToken;
}

export interface MultiplyOperation {
  readonly kind: "Multiply";
  readonly token: TimesToken;
}

export interface LessThanOperation {
  readonly kind: "LessThan";
  readonly token: LessThanToken;
}

export type BinaryOperation = AddOperation | SubOperation | MultiplyOperation | LessThanOperation;

export interface Node<T extends string> extends Position {
  readonly kind: T;
}

export interface NumberLiteralNode extends Node<"NumberLiteral"> {
  readonly value: number;
}

export interface BoolLiteralNode extends Node<"BoolLiteral"> {
  readonly value: boolean;
}

export interface IdentifierNode extends Node<"Identifier"> {
  readonly name: string;
}

export interface BinaryExpressionNode extends Node<"BinaryExpression"> {
  readonly op: BinaryOperation;
  readonly left: ExpressionNode;
  readonly right: ExpressionNode;
}

export interface IfExpressionNode extends Node<"IfExpression"> {
  readonly cond: ExpressionNode;
  readonly then: ExpressionNode;
  readonly else: ExpressionNode;
}

export interface LetExpressionNode extends Node<"LetExpression"> {
  readonly identifier: IdentifierNode;
  readonly binding: ExpressionNode;
  readonly exp: ExpressionNode;
}

export interface FunctionDefinitionNode extends Node<"FunctionDefinition"> {
  readonly param: IdentifierNode;
  readonly body: ExpressionNode;
}

export interface LetRecExpressionNode extends Node<"LetRecExpression"> {
  readonly identifier: IdentifierNode;
  readonly binding: FunctionDefinitionNode;
  readonly exp: ExpressionNode;
}

export interface FunctionApplicationNode extends Node<"FunctionApplication"> {
  readonly callee: ExpressionNode;
  readonly argument: ExpressionNode;
}

export type ExpressionNode =
  | NumberLiteralNode
  | BoolLiteralNode
  | IdentifierNode
  | BinaryExpressionNode
  | IfExpressionNode
  | LetExpressionNode
  | FunctionDefinitionNode
  | LetRecExpressionNode
  | FunctionApplicationNode;
