import { Tree } from "../structure";
import { Position } from "../parser-util";

export type Symbols = readonly [
  "(",
  ")",
  "+",
  "-",
  "*",
  "<",
  ">",
  "<=",
  ">=",
  "||",
  "&&",
  "==",
  "!=",
  "=",
  "->",
  "[",
  "]",
  "::",
  "|",
  "_",
];
export type SymbolKind = Symbols[number];
export type ReservedWords = readonly [
  "if",
  "then",
  "else",
  "let",
  "in",
  "fun",
  "rec",
  "true",
  "false",
  "match",
  "with",
];

export type ReservedWordKind = ReservedWords[number];

export interface TokenBase<T extends string> extends Position {
  readonly tokenKind: T;
}

export interface SymbolToken extends TokenBase<"Symbol"> {
  readonly symbol: SymbolKind;
}

export interface KeywordToken extends TokenBase<"Keyword"> {
  readonly keyword: ReservedWordKind;
}
export interface VariableToken extends TokenBase<"Variable"> {
  name: string;
}

export interface IntegerToken extends TokenBase<"Integer"> {
  readonly value: number;
}

export interface FloatToken extends TokenBase<"Float"> {
  readonly value: number;
}

export type Token = SymbolToken | KeywordToken | IntegerToken | FloatToken | VariableToken;

export interface OperationBase<T extends string> {
  readonly kind: T;
  readonly token: Token;
}

export interface MinusOperation extends OperationBase<"Minus"> {}

export interface AddOperation extends OperationBase<"Add"> {}

export interface SubOperation extends OperationBase<"Sub"> {}

export interface MultiplyOperation extends OperationBase<"Multiply"> {}

export interface LTOperation extends OperationBase<"LessThan"> {}

export interface GTOperation extends OperationBase<"GreaterThan"> {}

export interface LEOperation extends OperationBase<"LessEqualThan"> {}

export interface GEOperation extends OperationBase<"GreaterEqualThan"> {}

export interface OrOperation extends OperationBase<"Or"> {}

export interface AndOperation extends OperationBase<"And"> {}

export interface EQOperation extends OperationBase<"Equal"> {}

export interface NEOperation extends OperationBase<"NotEqual"> {}

export type UnaryOperation = MinusOperation;
export type BinaryOperation =
  | AddOperation
  | SubOperation
  | MultiplyOperation
  | LTOperation
  | GTOperation
  | LEOperation
  | GEOperation
  | OrOperation
  | AndOperation
  | EQOperation
  | NEOperation;

export interface Node<T extends string> extends Tree<T>, Position {}

export interface IntLiteralNode extends Node<"IntLiteral"> {
  readonly value: number;
}

export interface FloatLiteralNode extends Node<"FloatLiteral"> {
  readonly value: number;
}

export interface BoolLiteralNode extends Node<"BoolLiteral"> {
  readonly value: boolean;
}

export interface IdentifierNode extends Node<"Identifier"> {
  readonly name: string;
}

export interface UnaryExpressionNode extends Node<"UnaryExpression"> {
  readonly op: UnaryOperation;
  readonly exp: ExpressionNode;
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

export interface EmptyListNode extends Node<"EmptyList"> {}

export interface ListConstructorNode extends Node<"ListConstructor"> {
  readonly head: ExpressionNode;
  readonly tail: ExpressionNode;
}

export interface IdPatternNode extends Node<"IdPattern"> {
  readonly identifier: IdentifierNode;
}

export interface ListConsPatternNode extends Node<"ListConsPattern"> {
  readonly head: MatchPatternElementNode;
  readonly tail: MatchPatternNode;
}

export interface WildcardPatternNode extends Node<"WildcardPattern"> {}

export interface EmptyListPatternNode extends Node<"EmptyListPattern"> {}

export type MatchPatternElementNode = IdPatternNode | WildcardPatternNode | EmptyListPatternNode;
export type MatchPatternNode = ListConsPatternNode | MatchPatternElementNode;

export interface PatternMatchClauseNode extends Node<"PatternMatchClause"> {
  readonly pattern: MatchPatternNode;
  readonly exp: ExpressionNode;
}

export interface MatchOrClauseNode extends Node<"MatchOrClause"> {
  readonly patternMatch: PatternMatchClauseNode;
  readonly or: MatchClauseNode;
}

export type MatchClauseNode = PatternMatchClauseNode | MatchOrClauseNode;

export interface MatchExpressionNode extends Node<"MatchExpression"> {
  readonly exp: ExpressionNode;
  readonly matchClause: MatchClauseNode;
}

export type ExpressionNode =
  | IntLiteralNode
  | FloatLiteralNode
  | BoolLiteralNode
  | EmptyListNode
  | IdentifierNode
  | UnaryExpressionNode
  | BinaryExpressionNode
  | IfExpressionNode
  | LetExpressionNode
  | FunctionDefinitionNode
  | LetRecExpressionNode
  | FunctionApplicationNode
  | ListConstructorNode
  | MatchExpressionNode;
