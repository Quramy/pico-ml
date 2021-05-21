import { ok, error } from "../structure";
import { Parser, Position } from "./types";
import { option, vec, oneOf, expect as createExpect, tryWith, leftAssociate, rightAssociate } from "./combinator";
import { Scanner } from "./scanner";
import { isNullPosition } from "./null-position";

interface TestNode extends Position {
  readonly value: string;
}

interface BinNode extends Position {
  readonly left: ExprNode;
  readonly right: ExprNode;
}

type ExprNode = BinNode | TestNode;

const testParser: (x: string) => Parser<TestNode> = x => scanner => {
  if (scanner.startsWith(x)) {
    scanner.consume(x.length);
    return ok({
      value: x,
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
const bar = testParser("_");
const plus = testParser("+");
const lp = testParser("(");
const rp = testParser(")");

describe("expect", () => {
  it("should create a parser from parser sequence", () => {
    const parser = createExpect(dot, bar)((dot, bar) => ({ dot, bar, loc: undefined }));
    expect(parser(new Scanner("._")).unwrap()).toEqual({
      dot: {
        value: ".",
      },
      bar: {
        value: "_",
      },
    });
    expect(parser(new Scanner("_.")).ok).toBeFalsy();
  });
});

describe(tryWith, () => {
  const parser: Parser<TestNode> = oneOf(
    tryWith(createExpect(lp, dot, rp)((_, d): TestNode => d)),
    tryWith(createExpect(lp, plus, rp)((_, p): TestNode => p)),
  );
  it("should create a parser which cancels and rollbacks scanner state when the given parser fails", () => {
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

describe(option, () => {
  const optDot = option(dot);
  it("should create a parser to parse optional syntax", () => {
    expect(optDot(new Scanner(".")).unwrap()).toMatchObject({ value: "." });
    expect(optDot(new Scanner("")).map(isNullPosition).unwrap()).toBe(true);
  });
});

describe(vec, () => {
  const dotVec = vec(dot);
  it("should create a parser to parse repeatable syntax", () => {
    expect(dotVec(new Scanner("")).unwrap()).toMatchObject({ values: [] });
    expect(dotVec(new Scanner(".")).unwrap()).toMatchObject({ values: [{ value: "." }] });
    expect(dotVec(new Scanner("..")).unwrap()).toMatchObject({ values: [{ value: "." }, { value: "." }] });
  });
});

describe(leftAssociate, () => {
  const parser: Parser<BinNode | TestNode> = leftAssociate(oneOf(dot, bar))(plus, oneOf(dot, bar))(
    (left, _op, right): BinNode => ({ left, right }),
  );

  it("should create parser for infix left associated operator", () => {
    expect(parser(new Scanner("_")).unwrap()).toMatchObject({
      value: "_",
    });
    expect(parser(new Scanner("_+.")).unwrap()).toMatchObject({
      left: {
        value: "_",
      },
      right: {
        value: ".",
      },
    });
    expect(parser(new Scanner("_+.+_")).unwrap()).toMatchObject({
      left: {
        left: {
          value: "_",
        },
        right: {
          value: ".",
        },
      },
      right: {
        value: "_",
      },
    });
  });
});

describe(rightAssociate, () => {
  const parser: Parser<BinNode | TestNode> = rightAssociate(oneOf(dot, bar))(plus, oneOf(dot, bar))(
    (left, _op, right): BinNode => ({ left, right }),
  );

  it("should create parser for infix right associated operator", () => {
    expect(parser(new Scanner("_")).unwrap()).toMatchObject({
      value: "_",
    });
    expect(parser(new Scanner("_+.")).unwrap()).toMatchObject({
      left: {
        value: "_",
      },
      right: {
        value: ".",
      },
    });
    expect(parser(new Scanner("_+.+_")).unwrap()).toMatchObject({
      left: {
        value: "_",
      },
      right: {
        left: {
          value: ".",
        },
        right: {
          value: "_",
        },
      },
    });
  });
});
