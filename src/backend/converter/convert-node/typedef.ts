import { Result, ok } from "../../../structure";
import { TypeNode } from "../../ast-types";
import { FuncType } from "../../structure-types";
import { funcType } from "../../structure-factory";

export function convertType(typedef: TypeNode): Result<FuncType> {
  return ok(
    funcType(
      typedef.funcType.params.map(() => ({ kind: "Int32Type" })),
      typedef.funcType.results.map(() => ({ kind: "Int32Type" })),
    ),
  );
}
