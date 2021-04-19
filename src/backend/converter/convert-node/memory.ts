import { MemoryNode } from "../../ast-types";
import { MemType } from "../../structure-types";
import { memType } from "../../structure-factory";
import { convertLimits } from "./limits";

export function convertMemory(node: MemoryNode): MemType {
  return memType(convertLimits(node.limits));
}
