import { Position } from "../parser-util";
import { ModuleBodyNode, ModuleNode, Uint32LiteralNode, LimitsNode, MemoryNode, IdentifierNode } from "./ast-types";

export function uint32(value: number, pos?: Position): Uint32LiteralNode {
  return {
    kind: "Uint32Literal",
    value,
    loc: pos?.loc,
  };
}

export function limits(min: Uint32LiteralNode, max?: Uint32LiteralNode | null, pos?: Position): LimitsNode {
  return {
    kind: "Limits",
    min,
    max: max ?? null,
    loc: pos?.loc,
  };
}

export function memory(limits: LimitsNode, id?: IdentifierNode | null, pos?: Position): MemoryNode {
  return {
    kind: "Memory",
    limits,
    id: id ?? null,
    loc: pos?.loc,
  };
}

export function mod(body: readonly ModuleBodyNode[], id?: IdentifierNode | null, pos?: Position): ModuleNode {
  return {
    kind: "Module",
    body,
    id: id ?? null,
    loc: pos?.loc,
  };
}

export function identifier(value: string, pos?: Position): IdentifierNode {
  return {
    kind: "Identifier",
    value,
    loc: pos?.loc,
  };
}
