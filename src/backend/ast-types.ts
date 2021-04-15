import { Tree } from "../structure";
import { Position } from "../parser-util";

interface Node<T extends string> extends Tree<T>, Position {}

export type Symbols = ["(", ")"];
export type SymbolKind = Symbols[number];

export type ReservedWords = ["module", "memory", "table", "func"];
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

export interface IdentifierToken extends TokenBase<"Identifier"> {
  readonly name: string;
}

export interface IntToken extends TokenBase<"Int"> {
  readonly value: number;
}

export interface ModuleNode extends Node<"Module"> {
  readonly id: IdentifierNode | null;
  readonly body: readonly ModuleBodyNode[];
}

export interface MemoryNode extends Node<"Memory"> {
  readonly id: IdentifierNode | null;
  readonly limits: LimitsNode;
}

export interface LimitsNode extends Node<"Limits"> {
  readonly min: Uint32LiteralNode;
  readonly max: Uint32LiteralNode | null;
}

export interface IdentifierNode extends Node<"Identifier"> {
  readonly value: string;
}

interface NumberLiteral {
  readonly value: number;
}

export interface Uint32LiteralNode extends NumberLiteral, Node<"Uint32Literal"> {}

export interface Int32LiteralNode extends NumberLiteral, Node<"Int32Literal"> {}

export type ModuleBodyNode = MemoryNode;
