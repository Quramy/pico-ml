import { ok, error } from "../structure";
import { IdentifierNode } from "../syntax";
import { Environment } from "./types";

export function createRootEnvironment() {
  const env: Environment = {
    getIndex: node => {
      return error({
        message: `No identifier: ${node.name}`,
      });
    },
  };
  return env;
}

export function createChildEnvironment(id: IdentifierNode, parent: Environment) {
  const env: Environment = {
    getIndex(node) {
      if (node.name === id.name) {
        return ok(0);
      } else {
        return parent.getIndex(node).map(idx => idx + 1);
      }
    },
  };
  return env;
}
