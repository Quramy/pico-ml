import type { Parser } from "../types";

export type UnwrapToParseResult<T> = T extends Parser ? ReturnType<T> : never;
export type UnwrapToParseValue<T> = T extends Parser<infer S> ? S : never;
export type UnwrapToParseResultTuple<T> = { readonly [P in keyof T]: UnwrapToParseValue<T[P]> };
