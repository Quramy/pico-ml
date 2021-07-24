import { Node, ModuleNode, visitEachChild } from "../../wasm";

import { ModuleOptimizerFactory } from "../types";
import { reducePopEnvInstructions } from "../assets/modules/env";

export const reduceFunctionTailInstructionsFactory: ModuleOptimizerFactory = () => {
  return (moduleNode: ModuleNode) => {
    const visitor = <T extends Node>(node: T): T => {
      const ret = visitEachChild(node, visitor);
      if (ret.kind === "Func") {
        let instructions = ret.instructions;
        while (true) {
          const reduced = reducePopEnvInstructions(instructions);
          if (reduced.length < instructions.length) {
            instructions = reduced;
            continue;
          } else {
            break;
          }
        }
        return {
          ...ret,
          instructions,
        };
      } else {
        return ret;
      }
    };
    return visitor(moduleNode);
  };
};
