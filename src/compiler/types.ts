import { Result, ResultErrorBase, TraverserCallbackFn } from "../structure";
import { Position } from "../parser-util";
import { ExpressionNode, IdentifierNode } from "../syntax";
import { InstructionNode, ExprNode } from "../wasm";

export interface CompilationError extends ResultErrorBase {
  readonly occurence: Position;
}

export type CompilationValue = readonly InstructionNode[];

export type CompilationResult = Result<CompilationValue, CompilationError>;

export interface Environment {
  getIndex(identifier: IdentifierNode): number;
}

export interface DefinitionStack<T> {
  readonly enter: () => number;
  readonly leave: (param: T) => number;
}

export interface CompilationContext {
  readonly pushInstruction: (instruction: InstructionNode | readonly InstructionNode[]) => void;
  readonly useEnvironment: () => void;
  readonly setEnv: (env: Environment) => void;
  readonly getEnv: () => Environment;
  readonly funcDefStack: DefinitionStack<ExprNode>;
}

export type CompileNodeFn<K extends ExpressionNode["kind"]> = TraverserCallbackFn<
  ExpressionNode,
  CompilationContext,
  CompilationResult,
  K
>;
