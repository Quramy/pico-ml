import { ModuleOptimizer, ModuleOptimizerFactory, CompileNodeOptions } from "../types";

import { reduceFloatInstructionsFactory } from "./reduce-float-instructions";
import { reduceFunctionTailInstructionsFactory } from "./reduce-function-tail-instructions";

const id = <T>(x: T) => x;

function chain(...factories: readonly ModuleOptimizerFactory[]) {
  return factories.reduce((prev, factory) => {
    const optimizer = factory();
    const chainingOptimizer: ModuleOptimizer = moduleNode => optimizer(prev(moduleNode));
    return chainingOptimizer;
  }, id as ModuleOptimizer);
}

export function createModuleOptimizer(options: CompileNodeOptions): ModuleOptimizer {
  if (!options.reduceFloatInstructions) {
    return id;
  }
  return chain(reduceFloatInstructionsFactory, reduceFunctionTailInstructionsFactory);
}
