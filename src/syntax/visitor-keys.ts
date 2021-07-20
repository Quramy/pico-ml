import { Node, NodeBase } from "./types";

type NodePropertyNames<T> = T extends NodeBase<string> ? keyof T : never;

export const visitorKeys: readonly NodePropertyNames<Node>[] = [
  "argument",
  "binding",
  "body",
  "callee",
  "cond",
  "else",
  "exp",
  "head",
  "identifier",
  "left",
  "matchClause",
  "or",
  "param",
  "pattern",
  "patternMatch",
  "right",
  "tail",
  "then",
];
