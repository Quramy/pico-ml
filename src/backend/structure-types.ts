import {
  VariableInstructionKind,
  NumericInstructionKind,
  ControlInstructionKind,
  MemoryInstructionKind,
} from "./instructions-map";

export interface Limits {
  readonly kind: "Limits";
  min: number;
  max: number | null;
}

export interface Int32Type {
  readonly kind: "Int32Type";
}

export type ValType = Int32Type;

export type ResultType = readonly ValType[];

export interface FuncType {
  readonly kind: "FuncType";
  readonly paramType: ResultType;
  readonly resultType: ResultType;
}

export interface MemType {
  readonly kind: "MemType";
  readonly limits: Limits;
}

export interface TableType {
  readonly kind: "TableType";
  readonly limits: Limits;
  readonly refType: "Funcref" | "Externref";
}

export type UInt32Index = number;

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
  readonly instructionKind: NumericInstructionKind;
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

export interface Func {
  readonly kind: "Func";
  readonly type: UInt32Index;
  readonly locals: readonly ValType[];
  readonly body: Expr;
}

export interface FunctionIndexList {
  readonly kind: "FunctionIndexList";
  readonly offsetExpr: Expr;
  readonly indices: readonly number[];
}

export type ElemList = FunctionIndexList;

export interface Elem {
  readonly kind: "Elem";
  readonly elemList: ElemList;
}

export interface Export {
  readonly kind: "Export";
  readonly name: string;
  readonly exportKind: "Func" | "Memory";
  readonly index: number;
}

export interface Module {
  readonly kind: "Module";
  readonly types: readonly FuncType[];
  readonly funcs: readonly Func[];
  readonly mems: readonly MemType[];
  readonly tables: readonly TableType[];
  readonly elems: readonly Elem[];
  readonly exports: readonly Export[];
}
