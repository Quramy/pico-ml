import type { Parser } from "../types";
import type { Scanner } from "../scanner";
import type { UnwrapToParseResult } from "./shared-types";

export const tryWith =
  <T extends Parser>(parser: T) =>
  (scanner: Scanner): UnwrapToParseResult<T> => {
    const posToBack = scanner.pos;
    const r = parser(scanner);
    if (!r.ok) {
      scanner.back(posToBack);
      return r.error(v => ({ ...v, confirmed: false })) as any;
    }
    return r as any;
  };
