import { Result, ok } from "../../../structure";
import { Uint32LiteralNode } from "../../ast-types";

export function convertUint32(node: Uint32LiteralNode): Result<number> {
  return ok(node.value);
}

export function convertMaybeUint32(node: Uint32LiteralNode | null): Result<number | null> {
  return ok(node?.value ?? null);
}
