import { Result, ok, mapValue } from "../../../structure";
import { MemoryNode, LimitsNode } from "../../ast-types";
import { MemType, Limits } from "../../structure-types";
import { convertUint32, convertMaybeUint32 } from "./uint32";

function convertLimits(node: LimitsNode): Result<Limits> {
  return mapValue(
    convertUint32(node.min),
    convertMaybeUint32(node.max),
  )((min, max) => ok({ kind: "Limits", min, max }));
}

export function convertMemory(node: MemoryNode): Result<MemType> {
  return convertLimits(node.limits).map(limits => ({ kind: "MemType", limits }));
}
