import type { Parser, ParseResult, ParseValue } from "../types";
import type { Scanner } from "../scanner";

export const use = <T extends ParseValue>(cb: () => Parser<T>) => {
  return (scanner: Scanner) => cb()(scanner) as ParseResult<T>;
};
