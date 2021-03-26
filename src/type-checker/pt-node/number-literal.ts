import { PrimaryTypeNode } from "../types";
import { result } from "./_result";

export const numberLiteral: PrimaryTypeNode<"NumberLiteral"> = () => result.ok({ kind: "Int" });
