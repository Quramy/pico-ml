import { ResultErrorBase, Result, useResult, ok } from "../structure";
import { ExpressionNode, Token } from "./types";
import type { Scanner } from "./scanner";

export interface ParseError extends ResultErrorBase {
  readonly confirmed: boolean;
}

export type ParseValue = ExpressionNode | Token;
export type ParseResult<T extends ParseValue = ParseValue> = Result<T, ParseError>;

export interface Parser<T extends ParseValue = ParseValue> {
  (scanner: Scanner): ParseResult<T>;
}

type UnwrapToParseResult<T> = T extends Parser ? ReturnType<T> : never;
type UnwrapToParseValue<T> = T extends Parser<infer S> ? S : never;
type UnwrapToParseResultTuple<T> = { readonly [P in keyof T]: UnwrapToParseValue<T[P]> };

const { error } = useResult<ParseResult<any>>();

export const use = <T extends ParseValue>(cb: () => Parser<T>) => {
  return (scanner: Scanner) => cb()(scanner) as ParseResult<T>;
};

export const expect = <T extends readonly Parser[]>(...parsers: T) => <R extends ParseResult<any>>(
  cb: (...args: [...UnwrapToParseResultTuple<T>, Scanner]) => R,
) => {
  return (scanner: Scanner): R => {
    const results: any[] = [];
    let i = 0;
    for (const parser of parsers) {
      const result = parser(scanner);
      if (!result.ok)
        return error({
          ...result.value,
          confirmed: i !== 0,
        }) as R;
      results.push(result.value);
      i++;
    }
    return cb(...([...results, scanner] as any));
  };
};

type CompositeParser<U extends readonly Parser[]> = (
  scanner: Scanner,
) => { [P in keyof U]: UnwrapToParseResult<U[P]> }[number];

export const oneOf = <U extends readonly Parser[]>(...parsers: U) => {
  const parser: CompositeParser<U> = (scanner: Scanner) => {
    let result: ParseResult = error({ confirmed: false, message: "" });
    for (const parser of parsers.slice().reverse()) {
      result = parser(scanner);
      if (!result.ok && result.value.confirmed) return result;
      if (result.ok) return result as any;
    }
    return result;
  };
  return parser;
};

export const leftAssociate = <T extends readonly Parser[]>(...parsers: T) => <L extends ParseValue>(
  cb: (...args: [L, ...UnwrapToParseResultTuple<T>]) => L,
) => {
  return (first: L, scanner: Scanner) => {
    const inner = (node: L): L => {
      const results: ParseValue[] = [];
      for (const parser of parsers) {
        const r = parser(scanner);
        if (!r.ok) return node;
        results.push(r.value);
      }
      return inner(cb(node, ...(results as any)));
    };
    return ok(inner(first));
  };
};

export const rightAssociate = <T extends readonly Parser[]>(...parsers: T) => <L extends ParseValue>(
  cb: (...args: [L, ...UnwrapToParseResultTuple<T>]) => L,
) => {
  return (first: L, scanner: Scanner) => {
    const inner = (node: L): L => {
      const results: ParseValue[] = [];
      for (const parser of parsers) {
        const r = parser(scanner);
        if (!r.ok) return node;
        results.push(r.value);
      }
      const mid = results.slice(0, results.length - 1);
      const last = results[results.length - 1];
      return cb(node, ...([...mid, inner(last as any)] as any));
    };
    return ok(inner(first));
  };
};
