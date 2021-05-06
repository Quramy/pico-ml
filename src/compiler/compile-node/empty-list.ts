import { ok } from "../../structure";
import { CompileNodeFn } from "../types";
import { newListInstr } from "../assets/modules/list";

export const emptyList: CompileNodeFn<"EmptyList"> = (_, ctx) => {
  ctx.useList();
  return ok(newListInstr());
};
