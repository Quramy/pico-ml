import { Result, ok, mapValue } from "../../../structure";
import { LimitsNode } from "../../ast-types";
import { Limits } from "../../structure-types";
import { convertUint32, convertMaybeUint32 } from "./uint32";

export function convertLimits(node: LimitsNode): Result<Limits> {
  return mapValue(
    convertUint32(node.min),
    convertMaybeUint32(node.max),
  )((min, max) => ok({ kind: "Limits", min, max }));
}
