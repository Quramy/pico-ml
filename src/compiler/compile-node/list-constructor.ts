import { mapValue, ok } from "../../structure";
import { CompileNodeFn } from "../types";
import { pushLishInstr } from "../assets/modules/list";

export const listConstructor: CompileNodeFn<"ListConstructor"> = (node, ctx, next) => {
  ctx.useList();
  return mapValue(
    next(node.head, ctx),
    next(node.tail, ctx),
  )((headInstr, tailInstr) => ok([...tailInstr, ...headInstr, ...pushLishInstr()]));
};
