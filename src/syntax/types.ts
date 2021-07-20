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
  "+.",
  "-.",
  "*.",
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

export interface DecimalToken extends TokenBase<"Decimal"> {
  readonly value: number;
}

export type Token = SymbolToken | KeywordToken | IntegerToken | DecimalToken | VariableToken;

export interface OperationBase<T extends string> {
  readonly kind: T;
  readonly token: Token;
}

export interface MinusOperation extends OperationBase<"Minus"> {}

export interface FMinusOperation extends OperationBase<"FMinus"> {}

export interface AddOperation extends OperationBase<"Add"> {}

export interface SubOperation extends OperationBase<"Sub"> {}

export interface MultiplyOperation extends OperationBase<"Multiply"> {}

export interface FAddOperation extends OperationBase<"FAdd"> {}

export interface FSubOperation extends OperationBase<"FSub"> {}

export interface FMultiplyOperation extends OperationBase<"FMultiply"> {}

export interface OrOperation extends OperationBase<"Or"> {}

export interface AndOperation extends OperationBase<"And"> {}

export interface LTOperation extends OperationBase<"LessThan"> {}

export interface GTOperation extends OperationBase<"GreaterThan"> {}

export interface LEOperation extends OperationBase<"LessEqualThan"> {}

export interface GEOperation extends OperationBase<"GreaterEqualThan"> {}

export interface EQOperation extends OperationBase<"Equal"> {}

export interface NEOperation extends OperationBase<"NotEqual"> {}

export type ComparisonOperations = LTOperation | LEOperation | GTOperation | GEOperation | EQOperation | NEOperation;

export type UnaryOperation = MinusOperation | FMinusOperation;
export type BinaryOperation =
  | AddOperation
  | SubOperation
  | MultiplyOperation
  | FAddOperation
  | FSubOperation
  | FMultiplyOperation
  | OrOperation
  | AndOperation
  | ComparisonOperations;

export interface NodeBase<T extends string> extends Tree<T>, Position {}

export interface IntLiteralNode extends NodeBase<"IntLiteral"> {
  readonly value: number;
}

export interface FloatLiteralNode extends NodeBase<"FloatLiteral"> {
  readonly value: number;
}

export interface BoolLiteralNode extends NodeBase<"BoolLiteral"> {
  readonly value: boolean;
}

export interface IdentifierNode extends NodeBase<"Identifier"> {
  readonly name: string;
}

export interface UnaryExpressionNode extends NodeBase<"UnaryExpression"> {
  readonly op: UnaryOperation;
  readonly exp: ExpressionNode;
}

export interface BinaryExpressionNode extends NodeBase<"BinaryExpression"> {
  readonly op: BinaryOperation;
  readonly left: ExpressionNode;
  readonly right: ExpressionNode;
}

export interface IfExpressionNode extends NodeBase<"IfExpression"> {
  readonly cond: ExpressionNode;
  readonly then: ExpressionNode;
  readonly else: ExpressionNode;
}

export interface LetExpressionNode extends NodeBase<"LetExpression"> {
  readonly identifier: IdentifierNode;
  readonly binding: ExpressionNode;
  readonly exp: ExpressionNode;
}

export interface FunctionDefinitionNode extends NodeBase<"FunctionDefinition"> {
  readonly param: IdentifierNode;
  readonly body: ExpressionNode;
}

export interface LetRecExpressionNode extends NodeBase<"LetRecExpression"> {
  readonly identifier: IdentifierNode;
  readonly binding: FunctionDefinitionNode;
  readonly exp: ExpressionNode;
}

export interface FunctionApplicationNode extends NodeBase<"FunctionApplication"> {
  readonly callee: ExpressionNode;
  readonly argument: ExpressionNode;
}

export interface EmptyListNode extends NodeBase<"EmptyList"> {}

export interface ListConstructorNode extends NodeBase<"ListConstructor"> {
  readonly head: ExpressionNode;
  readonly tail: ExpressionNode;
}

export interface IdPatternNode extends NodeBase<"IdPattern"> {
  readonly identifier: IdentifierNode;
}

export interface ListConsPatternNode extends NodeBase<"ListConsPattern"> {
  readonly head: MatchPatternElementNode;
  readonly tail: MatchPatternNode;
}

export interface WildcardPatternNode extends NodeBase<"WildcardPattern"> {}

export interface EmptyListPatternNode extends NodeBase<"EmptyListPattern"> {}

export type MatchPatternElementNode = IdPatternNode | WildcardPatternNode | EmptyListPatternNode;
export type MatchPatternNode = ListConsPatternNode | MatchPatternElementNode;

export interface PatternMatchClauseNode extends NodeBase<"PatternMatchClause"> {
  readonly pattern: MatchPatternNode;
  readonly exp: ExpressionNode;
}

export interface MatchOrClauseNode extends NodeBase<"MatchOrClause"> {
  readonly patternMatch: PatternMatchClauseNode;
  readonly or: MatchClauseNode;
}

export type MatchClauseNode = PatternMatchClauseNode | MatchOrClauseNode;

export interface MatchExpressionNode extends NodeBase<"MatchExpression"> {
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

export type Node = ExpressionNode | MatchClauseNode | MatchPatternNode;
