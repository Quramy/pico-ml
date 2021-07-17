import {
  VariableInstructionKind,
  Int32NumericInstructionKind,
  ControlInstructionKind,
  MemoryInstructionKind,
} from "./instructions-map";

export interface Int32Type {
  readonly kind: "Int32Type";
}

export type ValType = Int32Type;

export type ResultType = readonly ValType[];

export type MutationKind = "Const" | "Var";

export interface GlobalType {
  readonly kind: "GlobalType";
  readonly valueType: ValType;
  readonly mutKind: MutationKind;
}

export type UInt32Index = number;

export interface NameAssociation {
  readonly kind: "NameAssociation";
  readonly idx: UInt32Index;
  readonly name: string;
}

export interface IndirectNameMap {
  readonly kind: "IndirectNameMap";
  readonly idx: UInt32Index;
  readonly nameMap: readonly NameAssociation[];
}

export type BlockType = null | ValType | UInt32Index;

export interface IfInstruction {
  readonly kind: "IfInstruction";
  readonly blockType: BlockType;
  readonly thenExpr: readonly Instruction[];
  readonly elseExpr: readonly Instruction[];
}

export interface ControlInstruction {
  readonly kind: "ControlInstruction";
  readonly instructionKind: ControlInstructionKind;
  readonly parameters: readonly number[];
}

export interface VariableInstruction {
  readonly kind: "VariableInstruction";
  readonly instructionKind: VariableInstructionKind;
  readonly parameters: readonly number[];
}

export interface NumericInstruction {
  readonly kind: "NumericInstruction";
  readonly instructionKind: Int32NumericInstructionKind;
  readonly parameters: readonly number[];
}

export interface MemoryInstruction {
  readonly kind: "MemoryInstruction";
  readonly instructionKind: MemoryInstructionKind;
  readonly offset: number;
  readonly align: number;
}

export type Instruction =
  | IfInstruction
  | ControlInstruction
  | VariableInstruction
  | NumericInstruction
  | MemoryInstruction;

export type Expr = readonly Instruction[];

export interface Limits {
  readonly kind: "Limits";
  min: number;
  max: number | null;
}

export interface FunctionIndexList {
  readonly kind: "FunctionIndexList";
  readonly offsetExpr: Expr;
  readonly indices: readonly number[];
}

export type ElemList = FunctionIndexList;

export interface FuncType {
  readonly kind: "FuncType";
  readonly paramType: ResultType;
  readonly resultType: ResultType;
}

export interface Func {
  readonly kind: "Func";
  readonly type: UInt32Index;
  readonly locals: readonly ValType[];
  readonly body: Expr;
}

export interface TableType {
  readonly kind: "TableType";
  readonly limits: Limits;
  readonly refType: "Funcref" | "Externref";
}

export interface MemType {
  readonly kind: "MemType";
  readonly limits: Limits;
}

export interface Global {
  readonly kind: "Global";
  readonly type: GlobalType;
  readonly expr: Expr;
}

export interface Export {
  readonly kind: "Export";
  readonly name: string;
  readonly exportKind: "Func" | "Memory" | "Table" | "Global";
  readonly index: number;
}

export interface Elem {
  readonly kind: "Elem";
  readonly elemList: ElemList;
}

export interface Names {
  readonly kind: "Names";
  readonly funcs: readonly NameAssociation[];
  readonly locals: readonly IndirectNameMap[];
  readonly types: readonly NameAssociation[];
  readonly tables: readonly NameAssociation[];
  readonly mems: readonly NameAssociation[];
  readonly globals: readonly NameAssociation[];
}

export interface Module {
  readonly kind: "Module";
  readonly names: Names;
  readonly types: readonly FuncType[];
  readonly funcs: readonly Func[];
  readonly tables: readonly TableType[];
  readonly mems: readonly MemType[];
  readonly globals: readonly Global[];
  readonly exports: readonly Export[];
  readonly elems: readonly Elem[];
}
