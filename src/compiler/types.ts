import { Result, ResultErrorBase, TraverserCallbackFn } from "../structure";
import { Position } from "../parser-util";
import { ExpressionNode, IdentifierNode } from "../syntax";
import { TypeValue } from "../type-checker";
import { ModuleNode, InstructionNode, ExprNode, LocalVarNode, IdentifierNode as WATIdNode } from "../wasm";

export interface CompilationError extends ResultErrorBase {
  readonly occurence: Position | undefined;
}

export type CompilationValue = readonly InstructionNode[];

export interface CompileNodeOptions {
  readonly typeValueMap: Map<string, TypeValue>;
  readonly dispatchUsingInferredType?: boolean;
}

export type CompiledModuleResult = Result<ModuleNode, CompilationError>;
export type CompilationResult = Result<CompilationValue, CompilationError>;

export interface Environment {
  getIndex(identifier: IdentifierNode): Result<number>;
}

export interface DefinitionStack<T, S = number> {
  readonly enter: () => number;
  readonly leave: (param: T) => S;
}

export interface CompilationContext<T extends {} = {}> {
  readonly getOptions: () => T;
  readonly pushInstruction: (instruction: InstructionNode | readonly InstructionNode[]) => void;
  readonly useAllocator: () => void;
  readonly useFloat: () => void;
  readonly useList: () => void;
  readonly useTuple: () => void;
  readonly useEnvironment: () => void;
  readonly useMatcher: () => void;
  readonly useComparator: (op: "lt" | "le" | "gt" | "ge" | "eq" | "ne") => void;
  readonly useLocalVar: (node: LocalVarNode) => void;
  readonly setEnv: (env: Environment) => void;
  readonly getEnv: () => Environment;
  readonly funcDefStack: DefinitionStack<ExprNode> & {
    readonly callInstr: () => ExprNode;
  };
  readonly matcherDefStack: DefinitionStack<ExprNode, WATIdNode>;
}

export type CompileNodeFn<K extends ExpressionNode["kind"]> = TraverserCallbackFn<
  ExpressionNode,
  CompilationContext<CompileNodeOptions>,
  CompilationResult,
  K
>;
