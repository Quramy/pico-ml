import { CompileNodeOptions } from "./compiler";
import { BinaryOutputOptions } from "./wasm";

export interface OutputOptions extends BinaryOutputOptions, Omit<CompileNodeOptions, "typeValueMap"> {}
