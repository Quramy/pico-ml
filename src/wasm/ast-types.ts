import { Tree } from "../structure";
import { Position } from "../parser-util";
import {
  ControlInstructionKind,
  Int32NumericInstructionKind,
  Int64NumericInstructionKind,
  Float32NumericInstructionKind,
  Float64NumericInstructionKind,
  VariableInstructionKind,
  MemoryInstructionKind,
} from "./instructions-map";

interface Node<T extends string> extends Tree<T>, Position {}

export type Symbols = ["(", ")"];
export type SymbolKind = Symbols[number];

export type ValueTypes = ["i32"];
export type ValueTypeKind = ValueTypes[number];

export type ReservedWords = [
  "global",
  "import",
  "export",
  "module",
  "type",
  "memory",
  "table",
  "elem",
  "func",
  "funcref",
  "externref",
  "param",
  "result",
  "local",
  "i32",
  "i64",
  "f32",
  "f64",
  "if",
  "else",
  "end",
  "block",
  "loop",
  "offset",
  "mut",
  "offset=",
  "align=",
];
export type ReservedWordKind =
  | ReservedWords[number]
  | ControlInstructionKind
  | VariableInstructionKind
  | Int32NumericInstructionKind
  | Int64NumericInstructionKind
  | Float32NumericInstructionKind
  | Float64NumericInstructionKind
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

export interface DecimalToken extends TokenBase<"Decimal"> {
  readonly value: number;
}

export interface StringToken extends TokenBase<"String"> {
  readonly value: string;
}

export interface IdentifierToken extends TokenBase<"Identifier"> {
  readonly name: string;
}

export interface NumberLiteral {
  readonly value: number;
}

export interface Uint32LiteralNode extends NumberLiteral, Node<"Uint32Literal"> {}

export interface Int32LiteralNode extends NumberLiteral, Node<"Int32Literal"> {}

export interface Int64LiteralNode extends NumberLiteral, Node<"Int64Literal"> {}

export interface Float32LiteralNode extends NumberLiteral, Node<"Float32Literal"> {}

export interface Float64LiteralNode extends NumberLiteral, Node<"Float64Literal"> {}

export interface IdentifierNode extends Node<"Identifier"> {
  readonly value: string;
}

export interface ValueTypeNode extends Node<"ValueType"> {
  readonly valueKind: ValueTypeKind;
}

export interface MutValueTypeNode extends Node<"MutValueType"> {
  readonly valueType: ValueTypeNode;
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

export interface Int32NumericInstructionNode extends Node<"Int32NumericInstruction"> {
  readonly instructionKind: Int32NumericInstructionKind;
  readonly parameters: readonly Int32LiteralNode[];
}

export interface Int64NumericInstructionNode extends Node<"Int64NumericInstruction"> {
  readonly instructionKind: Int64NumericInstructionKind;
  readonly parameters: readonly Int64LiteralNode[];
}

export interface Float32NumericInstructionNode extends Node<"Float32NumericInstruction"> {
  readonly instructionKind: Float32NumericInstructionKind;
  readonly parameters: readonly Float32LiteralNode[];
}

export interface Float64NumericInstructionNode extends Node<"Float64NumericInstruction"> {
  readonly instructionKind: Float64NumericInstructionKind;
  readonly parameters: readonly Float64LiteralNode[];
}

export interface MemoryInstructionNode extends Node<"MemoryInstruction"> {
  readonly instructionKind: MemoryInstructionKind;
  readonly offset: Uint32LiteralNode | null;
  readonly align: Uint32LiteralNode | null;
}

export type NumericInstructionNode =
  | Int32NumericInstructionNode
  | Int64NumericInstructionNode
  | Float32NumericInstructionNode
  | Float64NumericInstructionNode;

export type StructuredControleInstructionNode = IfInstructionNode;
export type PlainInstructionNode =
  | ControlInstructionNode
  | VariableInstructionNode
  | NumericInstructionNode
  | MemoryInstructionNode;

export type InstructionNode = StructuredControleInstructionNode | PlainInstructionNode;

export type ExprNode = readonly InstructionNode[];

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

export type RefKind = "Funcref" | "Externref";

export interface RefTypeNode extends Node<"RefType"> {
  readonly refKind: RefKind;
}

export interface HeapTypeNode extends Node<"HeapType"> {
  readonly refKind: "Func" | "Extern";
}

export interface LimitsNode extends Node<"Limits"> {
  readonly min: Uint32LiteralNode;
  readonly max: Uint32LiteralNode | null;
}

export type GlobalTypeNode = ValueTypeNode | MutValueTypeNode;

export interface GlobalNode extends Node<"Global"> {
  readonly id: IdentifierNode | null;
  readonly type: GlobalTypeNode;
  readonly expr: ExprNode;
}

export interface MemoryNode extends Node<"Memory"> {
  readonly id: IdentifierNode | null;
  readonly limits: LimitsNode;
}

export interface TableTypeNode extends Node<"TableType"> {
  readonly limits: LimitsNode;
  readonly refType: RefTypeNode;
}

export interface FunctionIndexListNode extends Node<"FunctionIndexList"> {
  readonly indices: readonly IndexNode[];
}

export type ElementListNode = FunctionIndexListNode;

export interface ElemNode extends Node<"Elem"> {
  readonly id: IdentifierNode | null;
  readonly offsetExpr: ExprNode;
  readonly elemList: ElementListNode;
}

export interface TableNode extends Node<"Table"> {
  readonly id: IdentifierNode | null;
  readonly tableType: TableTypeNode | null;
  readonly elemList: ElementListNode | null;
}

export interface ExportedFuncNode extends Node<"ExportedFunc"> {
  readonly index: IndexNode;
}

export interface ExportedGlobalNode extends Node<"ExportedGlobal"> {
  readonly index: IndexNode;
}

export interface ExportedMemoryNode extends Node<"ExportedMemory"> {
  readonly index: IndexNode;
}

export interface ExportedTableNode extends Node<"ExportedTable"> {
  readonly index: IndexNode;
}

export type ExportedSecNode = ExportedFuncNode | ExportedGlobalNode | ExportedMemoryNode | ExportedTableNode;

export interface ExportNode extends Node<"Export"> {
  readonly name: string;
  readonly sec: ExportedSecNode;
}

export type ModuleBodyNode = TypeNode | FuncNode | TableNode | MemoryNode | GlobalNode | ExportNode | ElemNode;

export interface ModuleNode extends Node<"Module"> {
  readonly id: IdentifierNode | null;
  readonly body: readonly ModuleBodyNode[];
}
