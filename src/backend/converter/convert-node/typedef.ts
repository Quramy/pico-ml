import { TypeNode } from "../../ast-types";
import { FuncType } from "../../structure-types";
import { funcType } from "../../structure-factory";

export function convertType(typedef: TypeNode): FuncType {
  return funcType(
    typedef.funcType.params.map(() => ({ kind: "Int32Type" })),
    typedef.funcType.results.map(() => ({ kind: "Int32Type" })),
  );
}
