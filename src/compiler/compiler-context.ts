import { InstructionNode, LocalVarNode } from "../wasm";
import { CompilationContext, Environment } from "./types";
import { ModuleDefinition } from "./module-builder";
import { getEnvModuleDefinition, localVarTypeForEnv, initEnvInstr } from "./assets/modules/env";
import { createRootEnvironment } from "./environment";
import { FunctionDefinitionStack } from "./function-definition-stack";

export class Context implements CompilationContext {
  private _env: Environment = createRootEnvironment();
  private _instructions: InstructionNode[] = [];
  private _enabledEnv = false;
  private _localsMainFn: LocalVarNode[] = [];
  private _dependencies: ModuleDefinition[] = [];

  public readonly funcDefStack = new FunctionDefinitionStack();

  constructor() {}

  pushInstruction(instruction: InstructionNode | readonly InstructionNode[]) {
    if (Array.isArray(instruction)) {
      instruction.forEach(instr => this._instructions.push(instr));
    } else {
      this._instructions.push(instruction as InstructionNode);
    }
  }

  getInstructions(): readonly InstructionNode[] {
    return this._instructions;
  }

  getDependencies(): readonly ModuleDefinition[] {
    return this._dependencies;
  }

  setEnv(env: Environment) {
    this._env = env;
  }

  getEnv() {
    return this._env;
  }

  getLocalsMainFn() {
    return this._localsMainFn;
  }

  useEnvironment() {
    if (this._enabledEnv) return;
    this._enabledEnv = true;
    this._dependencies.push(getEnvModuleDefinition());
    this._localsMainFn.push(localVarTypeForEnv());
    this._instructions = [...initEnvInstr(), ...this._instructions];
  }
}
