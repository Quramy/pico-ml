import { PrimaryTypeNode } from "../types";
import { result } from "./_result";

export const intLiteral: PrimaryTypeNode<"IntLiteral"> = node => result.ok({ kind: "Int", referencedFrom: node });
