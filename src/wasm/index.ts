import { Result } from "../structure";
import { ModuleNode } from "./ast-types";
import { convertModule } from "./converter";
import { unparse } from "./binary";
import * as f from "./ast-factory";

export { parse, unparse as printAST } from "./wat";
export * from "./ast-types";

export const factory = f;

export function generateBinary(moduleNode: ModuleNode): Result<Uint8Array> {
  return convertModule(moduleNode).map(unparse);
}
