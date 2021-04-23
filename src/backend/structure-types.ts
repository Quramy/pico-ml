import { VariableInstructionKind, NumericInstructionKind } from "./instructions-map";

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

export type UInt32Index = number;

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

export type Instruction = VariableInstruction | NumericInstruction;

export type Expr = readonly Instruction[];

export interface Func {
  readonly kind: "Func";
  readonly type: UInt32Index;
  readonly locals: readonly ValType[];
  readonly body: Expr;
}

export interface Module {
  readonly kind: "Module";
  readonly types: readonly FuncType[];
  readonly funcs: readonly Func[];
  readonly mems: readonly MemType[];
}
