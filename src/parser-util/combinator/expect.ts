import { ok, error } from "../../structure";
import type { Parser, ParseResult, ParseValue } from "../types";
import type { Scanner } from "../scanner";
import type { UnwrapToParseResultTuple } from "./shared-types";

export const expect =
  <T extends readonly Parser[]>(...parsers: T) =>
  <R extends ParseValue>(cb: (...args: [...UnwrapToParseResultTuple<T>, Scanner]) => R) => {
    return (scanner: Scanner): ParseResult<R> => {
      const results: any[] = [];
      let i = 0;
      for (const parser of parsers) {
        const result = parser(scanner);
        if (!result.ok)
          return error({
            ...result.value,
            confirmed: i !== 0,
          }) as ParseResult<R>;
        results.push(result.value);
        i++;
      }
      return ok(cb(...([...results, scanner] as any)));
    };
  };
