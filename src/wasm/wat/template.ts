import { Node, InstructionNode, ModuleBodyNode, LocalVarNode } from "../ast-types";
import { LRUCache } from "../../structure";

import { visitEachChild } from "./visitor";
import { Scanner } from "./scanner";
import { parseInstructionsVec, parseModuleFieldsVec, parseLocal } from "./parser";

export type TemplateSyntacticPlaceHolderValue = () => Node | readonly Node[];
export type TemplatePlaceHolderValue = string | number | TemplateSyntacticPlaceHolderValue;

function tagBase(spans: TemplateStringsArray, ...placeholders: TemplatePlaceHolderValue[]) {
  let srcString = spans[0];
  let j = 0;
  const nodeFn: TemplateSyntacticPlaceHolderValue[] = [];
  for (let i = 1; i < spans.length; i++) {
    if (typeof placeholders[i - 1] === "string" || typeof placeholders[i - 1] === "number") {
      srcString += `${placeholders[i - 1]}` + spans[i];
    } else {
      nodeFn.push(placeholders[i - 1] as TemplateSyntacticPlaceHolderValue);
      const p = ` %%PLACEHOLDER_${j++}%% `;
      srcString += p;
      srcString += spans[i];
    }
  }
  return { srcString, nodeFn };
}

const cache = new LRUCache<string, any>(1000);

function withCachedValue<T, S>(prefix: string, key: string, setter: (k: string) => T, cb: (arg: T) => S) {
  const cached = cache.get(prefix + key);
  if (cached) {
    return cb(cached);
  }
  const val = setter(prefix + key);
  cache.set(key, val);
  return cb(val);
}

function createNodeGeneratorFunction<T extends Node>(node: T, nodeFn: readonly TemplateSyntacticPlaceHolderValue[]) {
  const generateFunction = () => {
    const visitor = (node: Node): Node | readonly Node[] => {
      if (node.kind !== "SyntacticPlaceholder") {
        const { _nodeId, loc, ...rest } = visitEachChild(node, visitor);
        return { ...rest, loc: undefined };
      }
      return nodeFn[node.index]();
    };
    return visitor(node) as T;
  };
  return generateFunction;
}

function createVectorGeneratorFunction<T extends Node>(
  vecValues: readonly T[],
  nodeFn: readonly TemplateSyntacticPlaceHolderValue[],
) {
  const generateFunction = () => {
    const visitor = (node: Node): Node | readonly Node[] => {
      if (node.kind !== "SyntacticPlaceholder") {
        const { _nodeId, loc, ...rest } = visitEachChild(node, visitor);
        return { ...rest, loc: undefined };
      }
      return nodeFn[node.index]();
    };
    return vecValues.map(node => visitor(node)).flat() as T[];
  };
  return generateFunction;
}

function instructions<T extends InstructionNode = InstructionNode>(
  spans: TemplateStringsArray,
  ...placeholders: TemplatePlaceHolderValue[]
) {
  const { srcString, nodeFn } = tagBase(spans, ...placeholders);
  return withCachedValue(
    "instructions",
    srcString,
    () => parseInstructionsVec(new Scanner(srcString)).unwrap().values as T[],
    vecValues => createVectorGeneratorFunction(vecValues, nodeFn),
  );
}

function moduleFields<T extends ModuleBodyNode = ModuleBodyNode>(
  spans: TemplateStringsArray,
  ...placeholders: TemplatePlaceHolderValue[]
) {
  const { srcString, nodeFn } = tagBase(spans, ...placeholders);
  return withCachedValue(
    "moduleFields",
    srcString,
    () => parseModuleFieldsVec(new Scanner(srcString)).unwrap().values as T[],
    vecValues => createVectorGeneratorFunction(vecValues, nodeFn),
  );
}

function localVar<T extends LocalVarNode = LocalVarNode>(
  spans: TemplateStringsArray,
  ...placeholders: TemplatePlaceHolderValue[]
) {
  const { srcString, nodeFn } = tagBase(spans, ...placeholders);
  return withCachedValue(
    "localVar",
    srcString,
    () => parseLocal(new Scanner(srcString)).unwrap() as T,
    node => createNodeGeneratorFunction(node, nodeFn),
  );
}

export const template = {
  instructions,
  moduleFields,
  localVar,
};
