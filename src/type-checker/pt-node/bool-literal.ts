import { PrimaryTypeNode } from "../types";
import { result } from "./_result";

export const boolLiteral: PrimaryTypeNode<"BoolLiteral"> = () => result.ok({ kind: "Bool" });
