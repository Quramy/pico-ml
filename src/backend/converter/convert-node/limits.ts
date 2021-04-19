import { LimitsNode } from "../../ast-types";
import { Limits } from "../../structure-types";
import { limits } from "../../structure-factory";
import { convertUint32 } from "./uint32";

export function convertLimits(node: LimitsNode): Limits {
  return limits(convertUint32(node.min), node.max ? convertUint32(node.max) : null);
}
