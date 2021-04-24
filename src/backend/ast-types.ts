import { Tree } from "../structure";
import { Position } from "../parser-util";
import {
  ControlInstructionKind,
  NumericInstructionKind,
  VariableInstructionKind,
  MemoryInstructionKind,
} from "./instructions-map";

interface Node<T extends string> extends Tree<T>, Position {}

export type Symbols = ["(", ")"];
export type SymbolKind = Symbols[number];

export type ValueTypes = ["i32"];
export type ValueTypeKind = ValueTypes[number];

export type ReservedWords = [
  "import",
  "export",
  "module",
  "type",
  "memory",
  "table",
  "func",
  "param",
  "result",
  "local",
  "i32",
  "if",
  "else",
  "end",
  "block",
  "loop",
  "offset=",
  "align=",
];
export type ReservedWordKind =
  | ReservedWords[number]
  | ControlInstructionKind
  | VariableInstructionKind
  | NumericInstructionKind
  | MemoryInstructionKind;

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

export interface StringToken extends TokenBase<"String"> {
  readonly value: string;
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

export interface FuncTypeRefNode extends Node<"FuncTypeRef"> {
  readonly type: IndexNode;
}

export interface FuncSigNode extends Node<"FuncSig"> {
  readonly type: IndexNode | null;
  readonly params: readonly ParamTypeNode[];
  readonly results: readonly ValueTypeNode[];
}

export interface BlockTypeNode extends Node<"BlockType"> {
  readonly type: IndexNode | null;
  readonly results: readonly ValueTypeNode[];
}

export interface IfInstructionNode extends Node<"IfInstruction"> {
  readonly blockType: BlockTypeNode;
  readonly id: IdentifierNode | null;
  readonly elseId: IdentifierNode | null;
  readonly endId: IdentifierNode | null;
  readonly thenExpr: readonly InstructionNode[];
  readonly elseExpr: readonly InstructionNode[];
}

export interface ControlInstructionNode extends Node<"ControlInstruction"> {
  readonly instructionKind: ControlInstructionKind;
  readonly parameters: readonly (IndexNode | FuncTypeRefNode)[];
}

export interface VariableInstructionNode extends Node<"VariableInstruction"> {
  readonly instructionKind: VariableInstructionKind;
  readonly parameters: readonly IndexNode[];
}

export interface NumericInstructionNode extends Node<"NumericInstruction"> {
  readonly instructionKind: NumericInstructionKind;
  readonly parameters: readonly Int32LiteralNode[];
}

export interface MemoryInstructionNode extends Node<"MemoryInstruction"> {
  readonly instructionKind: MemoryInstructionKind;
  readonly offset: Uint32LiteralNode | null;
  readonly align: Uint32LiteralNode | null;
}

export type StructuredControleInstructionNode = IfInstructionNode;
export type PlainInstructionNode =
  | ControlInstructionNode
  | VariableInstructionNode
  | NumericInstructionNode
  | MemoryInstructionNode;

export type InstructionNode = StructuredControleInstructionNode | PlainInstructionNode;

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

export interface ExportedFuncNode extends Node<"ExportedFunc"> {
  readonly index: IndexNode;
}

export interface ExportedMemoryNode extends Node<"ExportedMemory"> {
  readonly index: IndexNode;
}

export type ExportedSecNode = ExportedFuncNode | ExportedMemoryNode;

export interface ExportNode extends Node<"Export"> {
  readonly name: string;
  readonly sec: ExportedSecNode;
}

export type ModuleBodyNode = TypeNode | FuncNode | MemoryNode | ExportNode;

export interface ModuleNode extends Node<"Module"> {
  readonly id: IdentifierNode | null;
  readonly body: readonly ModuleBodyNode[];
}
