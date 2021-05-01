import { Result, all } from "../../../structure";
import { GlobalNode } from "../../ast-types";
import { Global } from "../../structure-types";
import { RefereneceContext } from "../ref";
import { convertInstr } from "./func";

export function convertGlobalNode(node: GlobalNode, refCtx: RefereneceContext): Result<Global> {
  return all(node.expr.map(instr => convertInstr(instr, { refCtx, types: [] }))).map(expr => ({
    kind: "Global",
    expr,
    type: {
      kind: "GlobalType",
      mutKind: node.type.kind === "MutValueType" ? "Var" : "Const",
      valueType: { kind: "Int32Type" },
    },
  }));
}
