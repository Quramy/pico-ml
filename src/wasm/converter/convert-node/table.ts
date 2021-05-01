import { Result, error } from "../../../structure";
import { TableNode } from "../../ast-types";
import { TableType, Elem, Limits } from "../../structure-types";
import { convertLimits } from "./limits";
import { RefereneceContext } from "../ref";
import { convertElementList } from "./elem";

export interface State {
  readonly tables: readonly TableType[];
  readonly elems: readonly Elem[];
}

export function convertTable(node: TableNode, prev: State, refCtx: RefereneceContext): Result<State> {
  if (prev.tables.length > 0) {
    return error({ message: "Module can't have two or more tables." });
  }
  if (node.tableType && !node.elemList) {
    const { tableType } = node;
    return convertLimits(tableType.limits).map(limits => ({
      ...prev,
      tables: [
        ...prev.tables,
        {
          kind: "TableType",
          limits,
          refType: tableType.refType.refKind,
        },
      ],
    }));
  } else if (node.elemList && !node.tableType) {
    const { elemList } = node;
    const limits: Limits = {
      kind: "Limits",
      min: elemList.indices.length,
      max: elemList.indices.length,
    };
    return convertElementList(elemList, { refCtx, offsetExpr: null }).map(elemList => ({
      tables: [
        {
          kind: "TableType",
          limits,
          refType: "Funcref",
        },
      ],
      elems: [...prev.elems, { kind: "Elem", elemList }],
    }));
  } else {
    return error({ message: "Invalid table node" });
  }
}
