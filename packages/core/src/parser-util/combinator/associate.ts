import { Result, ok, error } from "../../structure/result";
import type { Parser, ParseValue, ParseResult, ParseError } from "../types";
import type { Scanner } from "../scanner";
import type { UnwrapToParseValue, UnwrapToParseResultTuple } from "./shared-types";

export const leftAssociate =
  <S extends Parser, L extends UnwrapToParseValue<S>>(leftParser: S) =>
  <T extends readonly Parser[]>(...parsers: T) =>
  <R extends ParseValue>(cb: (...args: [L | R, ...UnwrapToParseResultTuple<T>]) => R) => {
    return (scanner: Scanner): ParseResult<L | R> => {
      const first = leftParser(scanner) as ParseResult<L>;
      if (!first.ok) return first;
      const inner = (node: L | R): Result<R, ParseError> => {
        const results: ParseValue[] = [];
        let i = 0;
        for (const parser of parsers) {
          const r = parser(scanner);
          if (!r.ok)
            return (i === 0 ? ok(node) : error({ ...r.value, message: "Missing operand.", confirmed: false })) as any;
          results.push(r.value);
          i++;
        }
        return inner(cb(node, ...(results as any)));
      };
      return inner(first.value);
    };
  };

export const rightAssociate =
  <S extends Parser, L extends UnwrapToParseValue<S>>(leftParser: S) =>
  <T extends readonly Parser[]>(...parsers: T) =>
  <R extends ParseValue>(cb: (...args: [L, ...UnwrapToParseResultTuple<T>]) => R) => {
    return (scanner: Scanner) => {
      const first = leftParser(scanner) as ParseResult<L>;
      if (!first.ok) return first;
      const inner = (node: L): Result<R | L, ParseError> => {
        const results: ParseValue[] = [];
        let i = 0;
        for (const parser of parsers) {
          const r = parser(scanner);
          if (!r.ok) return i === 0 ? ok(node) : error({ ...r.value, message: "Missing operand.", confirmed: false });
          results.push(r.value);
          i++;
        }
        const mid = results.slice(0, results.length - 1);
        const last = results[results.length - 1];
        return ok(cb(node, ...([...mid, inner(last as any).value] as any)));
      };
      return inner(first.value);
    };
  };
