import { InstructionNode, LocalVarNode } from "../wasm";
import { CompilationContext, Environment } from "./types";
import { ModuleDefinition } from "./module-builder";
import { getAllocatorModuleDefinition } from "./assets/modules/alloc";
import { getListModuleDefinition } from "./assets/modules/list";
import { getTupleModuleDefinition } from "./assets/modules/tuple";
import { getEnvModuleDefinition, localVarTypeForEnv, initEnvInstr } from "./assets/modules/env";
import { getMatcherModuleDefinition } from "./assets/modules/matcher";
import { createRootEnvironment } from "./environment";
import { FunctionDefinitionStack } from "./function-definition-stack";
import { MatcherDefinitionStack } from "./matcher-definition-stack";

export class Context implements CompilationContext {
  private _env: Environment = createRootEnvironment();
  private _instructions: InstructionNode[] = [];
  private _enabledAllocator = false;
  private _enabledList = false;
  private _enabledTuple = false;
  private _enabledEnv = false;
  private _enabledMatcher = false;
  private _localsMainFn: LocalVarNode[] = [];
  private _dependencies: ModuleDefinition[] = [];

  public readonly funcDefStack = new FunctionDefinitionStack();
  public readonly matcherDefStack = new MatcherDefinitionStack();

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

  useLocalVar(node: LocalVarNode) {
    if (!node.id) return;
    if (this.funcDefStack.isInFunctionDefinition) {
      this.funcDefStack.useLocalVar(node);
    } else {
      if (this._localsMainFn.some(n => n.id?.value === node.id!.value)) return;
      this._localsMainFn.push(node);
    }
  }

  useAllocator() {
    if (this._enabledAllocator) return;
    this._enabledAllocator = true;
    this._dependencies.push(getAllocatorModuleDefinition());
  }

  useList() {
    if (this._enabledList) return;
    this._enabledList = true;
    this._dependencies.push(getListModuleDefinition());
  }

  useTuple() {
    if (this._enabledTuple) return;
    this._enabledTuple = true;
    this._dependencies.push(getTupleModuleDefinition());
  }

  useEnvironment() {
    if (this._enabledEnv) return;
    this._enabledEnv = true;
    this._dependencies.push(getEnvModuleDefinition());
    this._localsMainFn.push(localVarTypeForEnv());
    this._instructions = [...initEnvInstr(), ...this._instructions];
  }

  useMatcher() {
    if (this._enabledMatcher) return;
    this._enabledMatcher = true;
    this._dependencies.push(getMatcherModuleDefinition());
  }
}
