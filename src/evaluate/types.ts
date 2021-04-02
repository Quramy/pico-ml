import { Result, TraverserCallbackFn } from "../structure";
import { ExpressionNode, IdentifierNode, FunctionDefinitionNode, Position } from "../parser";

export interface EvaluationError {
  readonly message: string;
  readonly occurence: Position;
}

export interface Environment {
  get(identifier: IdentifierNode): EvaluationValue | undefined;
}

export interface Closure {
  readonly kind: "Closure";
  readonly functionDefinition: FunctionDefinitionNode;
  readonly env: Environment;
  readonly closureModifier?: string;
}

export interface RecClosure extends Closure {
  readonly closureModifier: "Recursive";
  readonly recursievId: IdentifierNode;
}

export type EvaluationList = readonly EvaluationValue[];
export type EvaluationValue = number | boolean | Closure | EvaluationList;

export type EvaluationResult = Result<EvaluationValue, EvaluationError>;
export type EvaluateNodeFn<K extends ExpressionNode["kind"]> = TraverserCallbackFn<
  ExpressionNode,
  Environment,
  EvaluationResult,
  K
>;
