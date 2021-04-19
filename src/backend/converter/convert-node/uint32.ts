import { Uint32LiteralNode } from "../../ast-types";

export function convertUint32(node: Uint32LiteralNode): number {
  return node.value;
}
