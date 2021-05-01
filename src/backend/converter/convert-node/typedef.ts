import { Result, ok } from "../../../structure";
import { TypeNode } from "../../ast-types";
import { FuncType } from "../../structure-types";

export function convertType(typedef: TypeNode): Result<FuncType> {
  return ok<FuncType>({
    kind: "FuncType",
    paramType: typedef.funcType.params.map(() => ({ kind: "Int32Type" })),
    resultType: typedef.funcType.results.map(() => ({ kind: "Int32Type" })),
  });
}
