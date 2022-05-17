import { ok } from "../../structure";
import type { Parser, Position } from "../types";
import type { Scanner } from "../scanner";
import { loc } from "../loc";
import type { UnwrapToParseValue } from "./shared-types";

export const vec = <T extends Parser, S extends UnwrapToParseValue<T>>(parser: T) => {
  const p: Parser<{ values: readonly S[] } & Position> = (scanner: Scanner) => {
    const values: S[] = [];
    while (true) {
      const r = parser(scanner);
      if (!r.ok) break;
      values.push(r.value as S);
    }
    const _loc = values.length ? loc(...values).loc : { pos: scanner.pos, end: scanner.pos };
    return ok({ values, loc: _loc });
  };
  return p;
};
