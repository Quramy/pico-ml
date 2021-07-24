import { InstructionNode, Node } from "../../wasm";

function hasNamedIndexParam(node: { readonly parameters: readonly Node[] }, name: string) {
  if (!node.parameters.length) return false;
  const param = node.parameters[0];
  if (param.kind !== "Identifier") return false;
  return param.value === name;
}

export function isCalling(node: InstructionNode, name: string) {
  if (node.kind !== "ControlInstruction") return false;
  if (node.instructionKind !== "call") return false;
  return hasNamedIndexParam(node, name);
}

export function isLocalSet(node: InstructionNode, name: string) {
  if (node.kind !== "VariableInstruction") return false;
  if (node.instructionKind !== "local.set") return false;
  return hasNamedIndexParam(node, name);
}

export function isLocalGet(node: InstructionNode, name: string) {
  if (node.kind !== "VariableInstruction") return false;
  if (node.instructionKind !== "local.get") return false;
  return hasNamedIndexParam(node, name);
}
