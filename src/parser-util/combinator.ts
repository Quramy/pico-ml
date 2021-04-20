import { Result, ok, error } from "../structure";
import { Position, Parser, ParseResult, ParseValue, ParseError, NullPosition } from "./types";
import type { Scanner } from "./scanner";
import { nullPosition } from "./null-position";
import { loc } from "./loc";

type UnwrapToParseResult<T> = T extends Parser ? ReturnType<T> : never;
type UnwrapToParseValue<T> = T extends Parser<infer S> ? S : never;
type UnwrapToParseResultTuple<T> = { readonly [P in keyof T]: UnwrapToParseValue<T[P]> };

export const use = <T extends ParseValue>(cb: () => Parser<T>) => {
  return (scanner: Scanner) => cb()(scanner) as ParseResult<T>;
};

export const expect = <T extends readonly Parser[]>(...parsers: T) => <R extends ParseValue>(
  cb: (...args: [...UnwrapToParseResultTuple<T>, Scanner]) => R,
) => {
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

export const tryWith = <T extends Parser>(parser: T) => (scanner: Scanner): UnwrapToParseResult<T> => {
  const posToBack = scanner.pos;
  const r = parser(scanner);
  if (!r.ok) {
    scanner.back(posToBack);
    return r.error(v => ({ ...v, confirmed: false })) as any;
  }
  return r as any;
};

export const option = <T extends Parser>(parser: T) => (
  scanner: Scanner,
): ParseResult<UnwrapToParseValue<T> | NullPosition> => {
  const r = parser(scanner);
  if (!r.ok) {
    return ok(nullPosition(scanner));
  } else {
    return ok(r.value) as any;
  }
};

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

export const leftAssociate = <S extends Parser, L extends UnwrapToParseValue<S>>(leftParser: S) => <
  T extends readonly Parser[]
>(
  ...parsers: T
) => (cb: (...args: [L, ...UnwrapToParseResultTuple<T>]) => L) => {
  return (scanner: Scanner): ParseResult<L> => {
    const first = leftParser(scanner) as ParseResult<L>;
    if (!first.ok) return first;
    const inner = (node: L): Result<L, ParseError> => {
      const results: ParseValue[] = [];
      let i = 0;
      for (const parser of parsers) {
        const r = parser(scanner);
        if (!r.ok) return i === 0 ? ok(node) : error({ ...r.value, message: "Missing operand.", confirmed: false });
        results.push(r.value);
        i++;
      }
      return inner(cb(node, ...(results as any)));
    };
    return inner(first.value);
  };
};

export const rightAssociate = <S extends Parser, L extends UnwrapToParseValue<S>>(leftParser: S) => <
  T extends readonly Parser[]
>(
  ...parsers: T
) => <R extends ParseValue>(cb: (...args: [L, ...UnwrapToParseResultTuple<T>]) => R) => {
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
