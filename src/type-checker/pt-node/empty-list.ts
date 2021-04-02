import { PrimaryTypeNode } from "../types";
import { result } from "./_result";

export const emptyList: PrimaryTypeNode<"EmptyList"> = (node, ctx) =>
  result.ok({ kind: "List", elementType: ctx.generator.gen(node), referencedFrom: node });
