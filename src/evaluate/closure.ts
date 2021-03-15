import { IdentifierNode, FunctionDefinitionNode } from "../parser";
import { Environment, Closure, RecClosure } from "./types";

export function createClosure(functionDefinition: FunctionDefinitionNode, env: Environment): Closure {
  return {
    kind: "Closure",
    env,
    functionDefinition,
  };
}

export function createRecClosure(
  functionDefinition: FunctionDefinitionNode,
  env: Environment,
  recursievId: IdentifierNode,
): RecClosure {
  return {
    ...createClosure(functionDefinition, env),
    closureModifier: "Recursive",
    recursievId,
  };
}
