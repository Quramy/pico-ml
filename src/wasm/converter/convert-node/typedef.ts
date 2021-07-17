import { Result, ok } from "../../../structure";
import { TypeNode } from "../../ast-types";
import { FuncType } from "../../structure-types";
import { mapToValTypeListFrom, toValType } from "./val-type";

export function convertType(typedef: TypeNode): Result<FuncType> {
  return ok<FuncType>({
    kind: "FuncType",
    paramType: mapToValTypeListFrom(typedef.funcType.params),
    resultType: typedef.funcType.results.map(toValType),
  });
}
