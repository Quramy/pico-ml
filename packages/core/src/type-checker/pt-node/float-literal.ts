import { PrimaryTypeNode } from "../types";
import { result } from "./_result";

export const floatLiteral: PrimaryTypeNode<"FloatLiteral"> = node => result.ok({ kind: "Float", referencedFrom: node });
