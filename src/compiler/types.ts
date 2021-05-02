import { Result, ResultErrorBase, TraverserCallbackFn } from "../structure";
import { Position } from "../parser-util";
import { ExpressionNode } from "../syntax";
import { InstructionNode } from "../wasm";

export interface CompilationError extends ResultErrorBase {
  readonly occurence: Position;
}

export type CompilationValue = true;

export type CompilationResult = Result<CompilationValue, CompilationError>;

export interface CompilationContext {
  readonly pushInstruction: (instruction: InstructionNode) => void;
}

export type CompileNodeFn<K extends ExpressionNode["kind"]> = TraverserCallbackFn<
  ExpressionNode,
  CompilationContext,
  CompilationResult,
  K
>;
