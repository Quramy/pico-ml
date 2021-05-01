import { Result, ok, all, mapValue } from "../../../structure";
import { ElementListNode, ExprNode, ElemNode } from "../../ast-types";
import { ElemList, Elem } from "../../structure-types";
import { RefereneceContext, findIndex } from "../ref";
import { convertInstr } from "./func";

export interface ConvertElementListContext {
  readonly refCtx: RefereneceContext;
  readonly offsetExpr: ExprNode | null;
}

export function convertElementList(
  node: ElementListNode,
  { refCtx, offsetExpr }: ConvertElementListContext,
): Result<ElemList> {
  if (offsetExpr) {
    return mapValue(
      all(node.indices.map(index => findIndex(refCtx.funcs, index))),
      all(offsetExpr.map(instrNode => convertInstr(instrNode, { refCtx, types: [] }))),
    )((indices, offsetExpr) =>
      ok({
        kind: "FunctionIndexList",
        indices,
        offsetExpr,
      }),
    );
  }
  return all(node.indices.map(index => findIndex(refCtx.funcs, index))).map(indices => ({
    kind: "FunctionIndexList",
    indices,
    offsetExpr: [{ kind: "NumericInstruction", instructionKind: "i32.const", parameters: [0] }],
  }));
}

export function convertElem(node: ElemNode, refCtx: RefereneceContext): Result<Elem> {
  return convertElementList(node.elemList, { refCtx, offsetExpr: node.offsetExpr }).map(elemList => ({
    kind: "Elem",
    elemList,
  }));
}
