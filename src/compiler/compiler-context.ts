import { InstructionNode, LocalVarNode, factory } from "../wasm";
import { CompilationContext, Environment } from "./types";
import { ModuleDefinition } from "./moduel-builder";
import { getEnvModuleDefinition } from "./assets/modules/env";
import { createRootEnvironment } from "./environment";

export class Context implements CompilationContext {
  private _env: Environment = createRootEnvironment();
  private _instructions: InstructionNode[] = [];
  private _enabledEnv = false;
  private _localsMainFn: LocalVarNode[] = [];
  private _dependencies: ModuleDefinition[] = [];

  constructor() {}

  pushInstruction(instruction: InstructionNode) {
    this._instructions.push(instruction);
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
    this._localsMainFn.push(factory.localVar(factory.valueType("i32"), factory.identifier("current_env_addr")));
    this._instructions = [
      factory.numericInstr("i32.const", [factory.int32(0)]),
      factory.variableInstr("local.set", [factory.identifier("current_env_addr")]),
      ...this._instructions,
    ];
  }
}
