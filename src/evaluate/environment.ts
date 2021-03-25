import { IdentifierNode } from "../parser";
import { Environment, EvaluationValue } from "./types";

export function createRootEnvironment(): Environment {
  return {
    get() {
      return undefined;
    },
  };
}

export function createChildEnvironment(id: IdentifierNode, value: EvaluationValue, parent: Environment): Environment {
  return {
    get(identifier: IdentifierNode) {
      if (id.name === identifier.name) {
        return value;
      }
      return parent.get(identifier);
    },
  };
}
