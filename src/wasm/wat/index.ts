import { createVisitorFunctions } from "../../structure";
import { visitorKeys } from "./visitor-keys";

export { unparse } from "./unparser";
export { parse } from "./parser";
export { template } from "./template";
export type { TemplatePlaceHolderValue } from "./template";

export const { visitEachChild } = createVisitorFunctions(visitorKeys);
