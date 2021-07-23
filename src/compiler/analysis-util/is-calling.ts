import { InstructionNode } from "../../wasm";

export function isCalling(node: InstructionNode, name: string) {
  if (node.kind !== "ControlInstruction") return false;
  if (!node.parameters.length) return false;
  const param = node.parameters[0];
  if (param.kind !== "Identifier") return false;
  return param.value === name;
}
