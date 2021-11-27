import { error } from "../../structure";
import type { Parser, ParseResult } from "../types";
import type { Scanner } from "../scanner";
import type { UnwrapToParseResult } from "./shared-types";

type CompositeParser<U extends readonly Parser[]> = (
  scanner: Scanner,
) => { [P in keyof U]: UnwrapToParseResult<U[P]> }[number];

export const oneOf = <U extends readonly Parser[]>(...parsers: U) => {
  const parser: CompositeParser<U> = (scanner: Scanner) => {
    const st = scanner.pos;
    let result: ParseResult = error({
      confirmed: false,
      message: "",
      occurence: {
        loc: { pos: st, end: st + 1 },
      },
    });
    for (const parser of parsers.slice().reverse()) {
      result = parser(scanner);
      if (!result.ok && result.value.confirmed) return result;
      if (result.ok) return result as any;
    }
    const end = scanner.pos === st ? st + 1 : scanner.pos;
    return error({
      message: "Unexpected expression.",
      confirmed: false,
      occurence: { loc: { pos: st, end } },
    });
  };
  return parser;
};
