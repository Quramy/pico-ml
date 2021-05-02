import { InstructionNode } from "../wasm";
import { CompilationContext } from "./types";

export class Context implements CompilationContext {
  private _instructions: InstructionNode[] = [];

  constructor() {}

  pushInstruction(instruction: InstructionNode) {
    this._instructions.push(instruction);
  }

  getInstructions(): readonly InstructionNode[] {
    return this._instructions;
  }
}
