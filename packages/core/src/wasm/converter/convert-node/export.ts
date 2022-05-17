import { Result } from "../../../structure";
import { Export } from "../../structure-types";
import { ExportNode } from "../../ast-types";
import { RefereneceContext, findIndex } from "../ref";

export function convertExport(node: ExportNode, refCtx: RefereneceContext): Result<Export> {
  if (node.sec.kind === "ExportedFunc") {
    return findIndex(refCtx.funcs, node.sec.index).map(index => ({
      kind: "Export",
      name: node.name,
      exportKind: "Func",
      index,
    }));
  } else if (node.sec.kind === "ExportedMemory") {
    return findIndex(refCtx.mems, node.sec.index).map(index => ({
      kind: "Export",
      name: node.name,
      exportKind: "Memory",
      index,
    }));
  } else if (node.sec.kind === "ExportedTable") {
    return findIndex(refCtx.tables, node.sec.index).map(index => ({
      kind: "Export",
      name: node.name,
      exportKind: "Table",
      index,
    }));
  } else if (node.sec.kind === "ExportedGlobal") {
    return findIndex(refCtx.globals, node.sec.index).map(index => ({
      kind: "Export",
      name: node.name,
      exportKind: "Global",
      index,
    }));
  }
  return undefined as never;
}
