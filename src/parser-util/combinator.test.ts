import { ok, error } from "../structure";
import { Parser, Position, ParseResult } from "./types";
import { option, vec, oneOf, expect as exp, tryWith } from "./combinator";
import { Scanner } from "./scanner";
import { isNullPosition } from "./null-position";

interface TestNode extends Position {
  readonly value: string;
}

const testParser: (x: string) => Parser<TestNode> = x => scanner => {
  if (scanner.startsWith(x)) {
    return ok({
      value: x,
      loc: scanner.consume(x.length),
    });
  }
  return error({
    confirmed: false,
    message: `expected ${x}`,
    occurence: {
      loc: {
        pos: scanner.pos,
        end: scanner.pos + 1,
      },
    },
  });
};

const dot = testParser(".");
const plus = testParser("+");
const lp = testParser("(");
const rp = testParser(")");

describe(option, () => {
  const optDot = option(dot);
  it("should create optional parser", () => {
    expect(optDot(new Scanner(".")).unwrap()).toMatchObject({ value: "." });
    expect(optDot(new Scanner("")).map(isNullPosition).unwrap()).toBe(true);
  });
});

describe(vec, () => {
  const dotVec = vec(dot);
  it("should parse sequence", () => {
    expect(dotVec(new Scanner("")).unwrap()).toMatchObject({ values: [] });
    expect(dotVec(new Scanner("..")).unwrap().values.length).toBe(2);
  });
});

describe(tryWith, () => {
  const parser: Parser<TestNode> = oneOf(
    tryWith(exp(lp, dot, rp)((_, d): ParseResult<TestNode> => ok(d))),
    tryWith(exp(lp, plus, rp)((_, p): ParseResult<TestNode> => ok(p))),
  );
  it("should cancel and rollback scanner state", () => {
    expect(
      parser(new Scanner("(+)"))
        .map(node => node.value)
        .unwrap(),
    ).toBe("+");
    expect(
      parser(new Scanner("(.)"))
        .map(node => node.value)
        .unwrap(),
    ).toBe(".");
  });
});
