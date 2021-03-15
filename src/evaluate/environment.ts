import { IdentifierNode } from "../parser";
import { Environment, EvaluationValue } from "./types";
import { getEvaluationResultValue } from "./utils";

export function createRootEnvironment(): Environment {
  return {
    get() {
      return undefined;
    },
    print() {
      return [];
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
    print() {
      return [...parent.print(), `${id.name}: ${getEvaluationResultValue({ ok: true, value })}`];
    },
  };
}
