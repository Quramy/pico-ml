import { Result } from "../../../structure";
import { MemoryNode } from "../../ast-types";
import { MemType } from "../../structure-types";
import { convertLimits } from "./limits";

export function convertMemory(node: MemoryNode): Result<MemType> {
  return convertLimits(node.limits).map(limits => ({ kind: "MemType", limits }));
}
