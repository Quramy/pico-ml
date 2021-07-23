import { Node, ModuleNode, visitEachChild } from "../../wasm";

import { reduceInstructions } from "../assets/modules/float";

import { ModuleOptimizerFactory } from "../types";

export const reduceFloatInstructionsFactory: ModuleOptimizerFactory = () => {
  return (moduleNode: ModuleNode) => {
    const visitor = <T extends Node>(node: T): T => {
      if (node.kind !== "Func") {
        return visitEachChild(node, visitor);
      }
      return {
        ...node,
        instructions: reduceInstructions(node.instructions),
      };
    };
    return visitor(moduleNode);
  };
};
