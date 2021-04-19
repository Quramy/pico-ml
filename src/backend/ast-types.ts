import { Tree } from "../structure";
import { Position } from "../parser-util";
import { NumericInstructionKind, VariableInstructionKind } from "./instructions-map";

interface Node<T extends string> extends Tree<T>, Position {}

export type Symbols = ["(", ")"];
export type SymbolKind = Symbols[number];

export type ValueTypes = ["i32"];
export type ValueTypeKind = ValueTypes[number];

export type ReservedWords = ["module", "type", "memory", "table", "func", "param", "result", "local", "i32"];
export type ReservedWordKind = ReservedWords[number] | VariableInstructionKind | NumericInstructionKind;

export interface TokenBase<T extends string> extends Position {
  readonly tokenKind: T;
}

export interface SymbolToken extends TokenBase<"Symbol"> {
  readonly symbol: SymbolKind;
}

export interface KeywordToken<K extends ReservedWordKind = ReservedWordKind> extends TokenBase<"Keyword"> {
  readonly keyword: K;
}

export interface IntToken extends TokenBase<"Int"> {
  readonly value: number;
}

export interface IdentifierToken extends TokenBase<"Identifier"> {
  readonly name: string;
}

interface NumberLiteral {
  readonly value: number;
}

export interface Uint32LiteralNode extends NumberLiteral, Node<"Uint32Literal"> {}

export interface Int32LiteralNode extends NumberLiteral, Node<"Int32Literal"> {}

export interface IdentifierNode extends Node<"Identifier"> {
  readonly value: string;
}

export interface ValueTypeNode extends Node<"ValueType"> {
  readonly valueKind: ValueTypeKind;
}

export interface ParamTypeNode extends Node<"ParamType"> {
  readonly id: IdentifierNode | null;
  readonly valueType: ValueTypeNode;
}

export interface FuncTypeNode extends Node<"FuncType"> {
  readonly params: readonly ParamTypeNode[];
  readonly results: readonly ValueTypeNode[];
}

export interface TypeNode extends Node<"Type"> {
  readonly id: IdentifierNode | null;
  readonly funcType: FuncTypeNode;
}

export type IndexNode = Uint32LiteralNode | IdentifierNode;

export interface FuncSigNode extends Node<"FuncSig"> {
  readonly type: IndexNode | null;
  readonly params: readonly ParamTypeNode[];
  readonly results: readonly ValueTypeNode[];
}

export interface VariableInstructionNode extends Node<"VariableInstruction"> {
  readonly instructionKind: VariableInstructionKind;
  readonly parameters: readonly IndexNode[];
}

export interface NumericInstructionNode extends Node<"NumericInstruction"> {
  readonly instructionKind: NumericInstructionKind;
  readonly parameters: readonly Int32LiteralNode[];
}

export type InstructionNode = VariableInstructionNode | NumericInstructionNode;

export interface LocalVarNode extends Node<"LocalVar"> {
  readonly id: IdentifierNode | null;
  readonly valueType: ValueTypeNode;
}

export interface FuncNode extends Node<"Func"> {
  readonly id: IdentifierNode | null;
  readonly signature: FuncSigNode;
  readonly locals: readonly LocalVarNode[];
  readonly instructions: readonly InstructionNode[];
}

export interface LimitsNode extends Node<"Limits"> {
  readonly min: Uint32LiteralNode;
  readonly max: Uint32LiteralNode | null;
}

export interface MemoryNode extends Node<"Memory"> {
  readonly id: IdentifierNode | null;
  readonly limits: LimitsNode;
}

export type ModuleBodyNode = TypeNode | FuncNode | MemoryNode;

export interface ModuleNode extends Node<"Module"> {
  readonly id: IdentifierNode | null;
  readonly body: readonly ModuleBodyNode[];
}
