import { Node, ModuleNode, visitEachChild } from "../../wasm";

import { reduceInstructions } from "../assets/modules/float";

import { ModuleOptimizerFactory } from "../types";

export const reduceFloatInstructionsFactory: ModuleOptimizerFactory = () => {
  return (moduleNode: ModuleNode) => {
    const visitor = <T extends Node>(node: T): T => {
      const ret = visitEachChild(node, visitor);
      if (ret.kind === "Func") {
        return {
          ...ret,
          instructions: reduceInstructions(ret.instructions),
        };
      } else if (ret.kind === "IfInstruction") {
        return {
          ...ret,
          thenExpr: reduceInstructions(ret.thenExpr),
          elseExpr: reduceInstructions(ret.elseExpr),
        };
      } else {
        return ret;
      }
    };
    return visitor(moduleNode);
  };
};
