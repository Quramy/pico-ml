export * from "./ast";

import { createTree } from "./ast";
import { tokenize } from "./tokenizer";

export function parse(input: string) {
  return createTree(tokenize(input));
}
