import { IdentifierNode } from "../parser";
import { TypeEnvironment, TypeScheme } from "./types";

export function createRootEnvironment(): TypeEnvironment {
  const root = {
    kind: "TypeEnvironment",
    get() {
      return undefined;
    },
    parent() {
      return undefined;
    },
    map() {
      return root;
    },
  } as const;
  return root;
}

export function createChildEnvironment(
  id: IdentifierNode,
  value: TypeScheme,
  parent: TypeEnvironment,
): TypeEnvironment {
  const env = {
    kind: "TypeEnvironment",
    get(identifier: IdentifierNode) {
      if (id.name === identifier.name) {
        return value;
      }
      return parent.get(identifier);
    },
    parent() {
      return {
        value,
        env: parent,
      };
    },
    map(cb: (value: TypeScheme) => TypeScheme) {
      const { env: pEnv } = env.parent();
      const np = pEnv.map(cb);
      const nv = cb(value);
      return createChildEnvironment(id, nv, np);
    },
  } as const;
  return env;
}
