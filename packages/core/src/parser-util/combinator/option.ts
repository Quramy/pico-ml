import { ok } from "../../structure";
import type { Parser, ParseResult, NullPosition } from "../types";
import type { Scanner } from "../scanner";
import { nullPosition } from "../null-position";
import type { UnwrapToParseValue } from "./shared-types";

export const option =
  <T extends Parser>(parser: T) =>
  (scanner: Scanner): ParseResult<UnwrapToParseValue<T> | NullPosition> => {
    const r = parser(scanner);
    if (!r.ok) {
      return ok(nullPosition(scanner));
    } else {
      return ok(r.value) as any;
    }
  };
