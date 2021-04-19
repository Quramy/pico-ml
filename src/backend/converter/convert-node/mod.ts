import { ModuleNode } from "../../ast-types";
import { Module, MemType, FuncType } from "../../structure-types";
import { convertType } from "./typedef";
import { convertMemory } from "./memory";

export function convertModule(node: ModuleNode): Module {
  const mems: MemType[] = [];
  const types: FuncType[] = [];
  for (const field of node.body) {
    switch (field.kind) {
      case "Type":
        types.push(convertType(field));
        break;
      case "Memory":
        mems.push(convertMemory(field));
        break;
    }
  }
  return {
    kind: "Module",
    types,
    mems,
    funcs: [],
  };
}
