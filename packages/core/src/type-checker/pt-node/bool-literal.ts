import { PrimaryTypeNode } from "../types";
import { result } from "./_result";

export const boolLiteral: PrimaryTypeNode<"BoolLiteral"> = node => result.ok({ kind: "Bool", referencedFrom: node });
