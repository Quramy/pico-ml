import assert from "assert";
import { parse } from "./parser";
import { ExpressionNode } from "./ast";

const exampleExpressions: Record<string, () => ExpressionNode> = {
  "1+2": () => ({
    kind: "BinaryExpression",
    op: "Add",
    left: {
      kind: "NumberLiteral",
      value: 1
    },
    right: {
      kind: "NumberLiteral",
      value: 2
    }
  }),
  "(1+2)*3": () => ({
    kind: "BinaryExpression",
    op: "Multiply",
    left: exampleExpressions["1+2"](),
    right: {
      kind: "NumberLiteral",
      value: 3
    }
  })
};

describe(parse, () => {
  test("parse", () => {
    expect(parse("1 + 2")).toEqual<ExpressionNode>(exampleExpressions["1+2"]());
    expect(parse("(1 + 2) * 3")).toEqual<ExpressionNode>(
      exampleExpressions["(1+2)*3"]()
    );
  });
});
