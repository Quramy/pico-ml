import { Node, InstructionNode, ModuleBodyNode } from "../ast-types";
import { visitorKeys } from "./visitor-keys";
import { LRUCache, createVisitorFunctions } from "../../structure";
import { Scanner } from "./scanner";
import { parseInstructionsVec, parseModuleFieldsVec } from "./parser";

export type TemplatePlaceHolderValue = () => Node | readonly Node[];

function tagBase(spans: TemplateStringsArray, ...placeholders: (string | TemplatePlaceHolderValue)[]) {
  let srcString = spans[0];
  let j = 0;
  const nodeFn: TemplatePlaceHolderValue[] = [];
  for (let i = 1; i < spans.length; i++) {
    if (typeof placeholders[i - 1] === "string") {
      srcString += placeholders[i - 1] + spans[i];
    } else {
      nodeFn.push(placeholders[i - 1] as TemplatePlaceHolderValue);
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

const { visitEachChild } = createVisitorFunctions(visitorKeys);

function createVectorGeneratorFunction<T extends Node>(
  vecValues: readonly T[],
  nodeFn: readonly TemplatePlaceHolderValue[],
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

export const template = {
  instructions,
  moduleFields,
};
