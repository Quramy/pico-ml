import assert from "assert";
import { parse } from "./parser";
import { ExpressionNode } from "./ast";
import { evaluate } from "./evaluator";

function parseTest() {
  const ex1: ExpressionNode = {
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
  };

  const ex2: ExpressionNode = {
    kind: "BinaryExpression",
    op: "Multiply",
    left: ex1,
    right: {
      kind: "NumberLiteral",
      value: 3
    }
  };

  assert.deepStrictEqual(parse("1 + 2"), ex1);
  assert.deepStrictEqual(parse("(1 + 2) * 3"), ex2);
}

function evalTest() {
  assert.equal(evaluate(parse("1")), 1);
  assert.equal(evaluate(parse("-2")), -2);
  assert.equal(evaluate(parse("true")), true);
  assert.equal(evaluate(parse("false")), false);
  assert.equal(evaluate(parse("1+1")), 2);
  assert.equal(evaluate(parse("if true then 0 else 1")), 0);
  assert.equal(
    evaluate(parse("if 2 < 1 then 0 else if false then 100 else 3 * 3")),
    9
  );
}

parseTest();
evalTest();
