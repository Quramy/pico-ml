import { IdentifierNode } from "../syntax";
import { Environment } from "./types";

export function createRootEnvironment() {
  const env: Environment = {
    getIndex: () => {
      throw new Error("root env");
    },
  };
  return env;
}

export function createChildEnvironment(id: IdentifierNode, parent: Environment) {
  const env: Environment = {
    getIndex(node) {
      if (node.name === id.name) {
        return 0;
      } else {
        return parent.getIndex(node) + 1;
      }
    },
  };
  return env;
}
