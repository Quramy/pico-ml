import { Result, ok, error } from "../../structure";
import { IndexNode } from "../ast-types";
export interface RefereneceContext {
  readonly types: Map<string, number>;
  readonly funcs: Map<string, number>;
  readonly tables: Map<string, number>;
  readonly mems: Map<string, number>;
  readonly globals: Map<string, number>;
  readonly elem: Map<string, number>;
  readonly locals?: Map<string, number>;
  readonly labels?: Map<string, number>;
}

export function findIndex(refMap: Map<string, number>, idx: IndexNode): Result<number> {
  if (idx.kind === "Uint32Literal") return ok(idx.value);
  const i = refMap.get(idx.value);
  if (i == null) {
    return error({ message: `Not found "${idx.value}"` });
  }
  return ok(i);
}
