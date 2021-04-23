import { Result, ok, mapValue } from "../../../structure";
import { MemoryNode, LimitsNode } from "../../ast-types";
import { MemType, Limits } from "../../structure-types";
import { memType, limits } from "../../structure-factory";
import { convertUint32 } from "./uint32";

function convertLimits(node: LimitsNode): Result<Limits> {
  if (node.max) {
    return mapValue(convertUint32(node.min), convertUint32(node.max))((min, max) => ok(limits(min, max)));
  } else {
    return convertUint32(node.min).map(min => limits(min, null));
  }
}

export function convertMemory(node: MemoryNode): Result<MemType> {
  return convertLimits(node.limits).map(memType);
}
