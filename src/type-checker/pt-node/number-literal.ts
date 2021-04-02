import { PrimaryTypeNode } from "../types";
import { result } from "./_result";

export const numberLiteral: PrimaryTypeNode<"NumberLiteral"> = node => result.ok({ kind: "Int", referencedFrom: node });
