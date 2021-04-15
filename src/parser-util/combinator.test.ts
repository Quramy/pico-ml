import { ok, error } from "../structure";
import { Parser, Position } from "./types";
import { option, vec } from "./combinator";
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
