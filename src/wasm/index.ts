import { Result } from "../structure";
import { ModuleNode } from "./ast-types";
import { convertModule } from "./converter";
import { unparse } from "./binary";
import * as f from "./wat/ast-factory";
import { BinaryOutputOptions } from "./types";

export * from "./types";
export { parse, unparse as printAST, template as wat, TemplatePlaceHolderValue, visitEachChild } from "./wat";
export * from "./ast-types";

export const factory = f;

export function generateBinary(moduleNode: ModuleNode, options: BinaryOutputOptions): Result<Uint8Array> {
  return convertModule(moduleNode).map(mod => unparse(mod, options));
}

export function generateBinaryWithDefaultOptions(moduleNode: ModuleNode): Result<Uint8Array> {
  return generateBinary(moduleNode, { enableNameSection: false });
}
