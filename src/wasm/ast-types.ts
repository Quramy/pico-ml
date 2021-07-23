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

export interface NodeBase<T extends string> extends Tree<T>, Position {}

export type Symbols = ["(", ")"];
export type SymbolKind = Symbols[number];

export type ValueTypes = ["i32", "i64", "f32", "f64"];
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

export interface SyntacticPlaceholderNode extends NodeBase<"SyntacticPlaceholder"> {
  readonly index: number;
}

export interface Uint32LiteralNode extends NumberLiteral, NodeBase<"Uint32Literal"> {}

export interface Int32LiteralNode extends NumberLiteral, NodeBase<"Int32Literal"> {}

export interface Int64LiteralNode extends NumberLiteral, NodeBase<"Int64Literal"> {}

export interface Float32LiteralNode extends NumberLiteral, NodeBase<"Float32Literal"> {}

export interface Float64LiteralNode extends NumberLiteral, NodeBase<"Float64Literal"> {}

export type LiteralNode =
  | Uint32LiteralNode
  | Int32LiteralNode
  | Int64LiteralNode
  | Float32LiteralNode
  | Float64LiteralNode;

export interface IdentifierNode extends NodeBase<"Identifier"> {
  readonly value: string;
}

export interface ValueTypeNode extends NodeBase<"ValueType"> {
  readonly valueKind: ValueTypeKind;
}

export interface MutValueTypeNode extends NodeBase<"MutValueType"> {
  readonly valueType: ValueTypeNode;
}

export interface ParamTypeNode extends NodeBase<"ParamType"> {
  readonly id: IdentifierNode | null;
  readonly valueType: ValueTypeNode;
}

export interface FuncTypeNode extends NodeBase<"FuncType"> {
  readonly params: readonly ParamTypeNode[];
  readonly results: readonly ValueTypeNode[];
}

export interface TypeNode extends NodeBase<"Type"> {
  readonly id: IdentifierNode | null;
  readonly funcType: FuncTypeNode;
}

export type IndexNode = Uint32LiteralNode | IdentifierNode;

export interface FuncTypeRefNode extends NodeBase<"FuncTypeRef"> {
  readonly type: IndexNode;
}

export interface FuncSigNode extends NodeBase<"FuncSig"> {
  readonly type: IndexNode | null;
  readonly params: readonly ParamTypeNode[];
  readonly results: readonly ValueTypeNode[];
}

export interface BlockTypeNode extends NodeBase<"BlockType"> {
  readonly type: IndexNode | null;
  readonly results: readonly ValueTypeNode[];
}

export interface IfInstructionNode extends NodeBase<"IfInstruction"> {
  readonly blockType: BlockTypeNode;
  readonly id: IdentifierNode | null;
  readonly elseId: IdentifierNode | null;
  readonly endId: IdentifierNode | null;
  readonly thenExpr: readonly InstructionNode[];
  readonly elseExpr: readonly InstructionNode[];
}

export interface ControlInstructionNode extends NodeBase<"ControlInstruction"> {
  readonly instructionKind: ControlInstructionKind;
  readonly parameters: readonly (IndexNode | FuncTypeRefNode)[];
}

export interface VariableInstructionNode extends NodeBase<"VariableInstruction"> {
  readonly instructionKind: VariableInstructionKind;
  readonly parameters: readonly IndexNode[];
}

export interface Int32NumericInstructionNode extends NodeBase<"Int32NumericInstruction"> {
  readonly instructionKind: Int32NumericInstructionKind;
  readonly parameters: readonly Int32LiteralNode[];
}

export interface Int64NumericInstructionNode extends NodeBase<"Int64NumericInstruction"> {
  readonly instructionKind: Int64NumericInstructionKind;
  readonly parameters: readonly Int64LiteralNode[];
}

export interface Float32NumericInstructionNode extends NodeBase<"Float32NumericInstruction"> {
  readonly instructionKind: Float32NumericInstructionKind;
  readonly parameters: readonly Float32LiteralNode[];
}

export interface Float64NumericInstructionNode extends NodeBase<"Float64NumericInstruction"> {
  readonly instructionKind: Float64NumericInstructionKind;
  readonly parameters: readonly Float64LiteralNode[];
}

export interface MemoryInstructionNode extends NodeBase<"MemoryInstruction"> {
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

export interface LocalVarNode extends NodeBase<"LocalVar"> {
  readonly id: IdentifierNode | null;
  readonly valueType: ValueTypeNode;
}

export interface FuncNode extends NodeBase<"Func"> {
  readonly id: IdentifierNode | null;
  readonly signature: FuncSigNode;
  readonly locals: readonly LocalVarNode[];
  readonly instructions: readonly InstructionNode[];
}

export type RefKind = "Funcref" | "Externref";

export interface RefTypeNode extends NodeBase<"RefType"> {
  readonly refKind: RefKind;
}

export interface HeapTypeNode extends NodeBase<"HeapType"> {
  readonly refKind: "Func" | "Extern";
}

export interface LimitsNode extends NodeBase<"Limits"> {
  readonly min: Uint32LiteralNode;
  readonly max: Uint32LiteralNode | null;
}

export type GlobalTypeNode = ValueTypeNode | MutValueTypeNode;

export interface GlobalNode extends NodeBase<"Global"> {
  readonly id: IdentifierNode | null;
  readonly type: GlobalTypeNode;
  readonly expr: ExprNode;
}

export interface MemoryNode extends NodeBase<"Memory"> {
  readonly id: IdentifierNode | null;
  readonly limits: LimitsNode;
}

export interface TableTypeNode extends NodeBase<"TableType"> {
  readonly limits: LimitsNode;
  readonly refType: RefTypeNode;
}

export interface FunctionIndexListNode extends NodeBase<"FunctionIndexList"> {
  readonly indices: readonly IndexNode[];
}

export type ElementListNode = FunctionIndexListNode;

export interface ElemNode extends NodeBase<"Elem"> {
  readonly id: IdentifierNode | null;
  readonly offsetExpr: ExprNode;
  readonly elemList: ElementListNode;
}

export interface TableNode extends NodeBase<"Table"> {
  readonly id: IdentifierNode | null;
  readonly tableType: TableTypeNode | null;
  readonly elemList: ElementListNode | null;
}

export interface ExportedFuncNode extends NodeBase<"ExportedFunc"> {
  readonly index: IndexNode;
}

export interface ExportedGlobalNode extends NodeBase<"ExportedGlobal"> {
  readonly index: IndexNode;
}

export interface ExportedMemoryNode extends NodeBase<"ExportedMemory"> {
  readonly index: IndexNode;
}

export interface ExportedTableNode extends NodeBase<"ExportedTable"> {
  readonly index: IndexNode;
}

export type ExportedSecNode = ExportedFuncNode | ExportedGlobalNode | ExportedMemoryNode | ExportedTableNode;

export interface ExportNode extends NodeBase<"Export"> {
  readonly name: string;
  readonly sec: ExportedSecNode;
}

export type ModuleBodyNode = TypeNode | FuncNode | TableNode | MemoryNode | GlobalNode | ExportNode | ElemNode;

export interface ModuleNode extends NodeBase<"Module"> {
  readonly id: IdentifierNode | null;
  readonly body: readonly ModuleBodyNode[];
}

export type Node =
  | SyntacticPlaceholderNode
  | LiteralNode
  | IdentifierNode
  | ValueTypeNode
  | MutValueTypeNode
  | ParamTypeNode
  | FuncTypeNode
  | TypeNode
  | FuncTypeRefNode
  | FuncSigNode
  | BlockTypeNode
  | InstructionNode
  | LocalVarNode
  | FuncNode
  | RefTypeNode
  | HeapTypeNode
  | LimitsNode
  | GlobalNode
  | MemoryNode
  | TableTypeNode
  | FunctionIndexListNode
  | ElemNode
  | TableNode
  | ExportedSecNode
  | ExportNode
  | ModuleNode;
