import { ok, Result } from "../../../structure";
import { ValType } from "../../structure-types";
import { ValueTypeNode } from "../../ast-types";

export function toValType(node: ValueTypeNode): ValType {
  switch (node.valueKind) {
    case "i32":
      return {
        kind: "Int32Type",
      };
    case "i64":
      return {
        kind: "Int64Type",
      };
    case "f32":
      return {
        kind: "Float32Type",
      };
    case "f64":
      return {
        kind: "Float64Type",
      };
    default:
      throw new Error(`Invalid value kind: ${node.valueKind}`);
  }
}

type ValueTypeHolderArray = readonly { readonly valueType: ValueTypeNode }[];

export function convertValueType(node: ValueTypeNode): Result<ValType> {
  return ok(toValType(node));
}

export function mapToValTypeListFrom(list: ValueTypeHolderArray) {
  return list.map(item => toValType(item.valueType));
}
