import { createVisitorFunctions } from "../../structure";
import type { Node, NodeBase } from "../ast-types";

type NodePropertyNames<T> = T extends NodeBase<string> ? keyof T : never;

export const visitorKeys: readonly NodePropertyNames<Node>[] = [
  "align",
  "blockType",
  "body",
  "elemList",
  "elseExpr",
  "elseId",
  "endId",
  "expr",
  "funcType",
  "id",
  "index",
  "indices",
  "instructions",
  "limits",
  "locals",
  "max",
  "min",
  "name",
  "offset",
  "offsetExpr",
  "parameters",
  "params",
  "refKind",
  "refType",
  "results",
  "sec",
  "signature",
  "tableType",
  "thenExpr",
  "type",
  "valueType",
];

export const { visitEachChild } = createVisitorFunctions(visitorKeys);
