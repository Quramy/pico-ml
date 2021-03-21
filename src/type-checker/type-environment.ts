import { IdentifierNode } from "../parser";
import { TypeEnvironment, TypeValue } from "./types";

export function createRootEnvironment(): TypeEnvironment {
  return {
    get() {
      return undefined;
    },
  };
}

export function createChildEnvironment(id: IdentifierNode, value: TypeValue, parent: TypeEnvironment): TypeEnvironment {
  return {
    get(identifier: IdentifierNode) {
      if (id.name === identifier.name) {
        return value;
      }
      return parent.get(identifier);
    },
  };
}
