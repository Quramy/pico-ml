import { Result, ResultErrorBase, TraverserCallbackFn } from "../structure";
import { Position } from "../parser-util";
import { ExpressionNode, IdentifierNode } from "../syntax";
import { InstructionNode } from "../wasm";

export interface CompilationError extends ResultErrorBase {
  readonly occurence: Position;
}

export type CompilationValue = true;

export type CompilationResult = Result<CompilationValue, CompilationError>;

export interface Environment {
  getIndex(identifier: IdentifierNode): number;
}

export interface CompilationContext {
  readonly pushInstruction: (instruction: InstructionNode | readonly InstructionNode[]) => void;
  readonly useEnvironment: () => void;
  readonly setEnv: (env: Environment) => void;
  readonly getEnv: () => Environment;
}

export type CompileNodeFn<K extends ExpressionNode["kind"]> = TraverserCallbackFn<
  ExpressionNode,
  CompilationContext,
  CompilationResult,
  K
>;
