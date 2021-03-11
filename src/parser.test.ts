import assert from "assert";
import { parse } from "./parser";
import {
  ExpressionNode,
  NumberLiteralNode,
  BoolLiteralNode,
  IdentifierNode,
  BinaryExpressionNode
} from "./ast";

const num = (value: number) =>
  ({
    kind: "NumberLiteral",
    value
  } as NumberLiteralNode);

const bool = (value: boolean) =>
  ({
    kind: "BoolLiteral",
    value
  } as BoolLiteralNode);

const id = (name: string) => ({ kind: "Identifier", name } as IdentifierNode);

const expr = <T extends ExpressionNode = ExpressionNode>(node: T) => node;

const fixture = {
  "1+2": () =>
    expr({
      kind: "BinaryExpression",
      op: "Add",
      left: num(1),
      right: num(2)
    }),
  "(1+2)*3": () =>
    expr({
      kind: "BinaryExpression",
      op: "Multiply",
      left: fixture["1+2"](),
      right: num(3)
    }),
  "if true then 0 else 1": () =>
    expr({
      kind: "IfExpression",
      cond: bool(true),
      then: num(0),
      else: num(1)
    }),
  "if true then 0 else 1 + if true then 0 else 1": () =>
    expr({
      kind: "IfExpression",
      cond: bool(true),
      then: num(0),
      else: {
        kind: "BinaryExpression",
        op: "Add",
        left: num(1),
        right: fixture["if true then 0 else 1"]()
      }
    }),
  "(if true then 0 else 1) + if true then 0 else 1": () =>
    expr({
      kind: "BinaryExpression",
      op: "Add",
      left: fixture["if true then 0 else 1"](),
      right: fixture["if true then 0 else 1"]()
    }),
  "let x = 1 + 2 in x": () =>
    expr({
      kind: "LetExpression",
      identifier: id("x"),
      binding: fixture["1+2"](),
      exp: id("x")
    }),
  "fun x -> 1": () =>
    expr({
      kind: "FunctionDefinition",
      param: id("x"),
      body: num(1)
    }),
  "fun x -> if true then 0 else 1": () => expr({
    kind: "FunctionDefinition",
    param: id("x"),
    body: fixture["if true then 0 else 1"](),
  }),
  "fun f -> if true then fun x -> 1 else fun x -> 1": () => expr({
    kind: "FunctionDefinition",
    param: id("f"),
    body: {
      kind: "IfExpression",
      cond: bool(true),
      then: fixture["fun x -> 1"](),
      else: fixture["fun x -> 1"](),
    },
  }),
  "f x": () =>
    expr({
      kind: "FunctionApplication",
      callee: id("f"),
      argument: id("x")
    }),
  "f a b": () =>
    expr({
      kind: "FunctionApplication",
      callee: {
        kind: "FunctionApplication",
        callee: id("f"),
        argument: id("a")
      },
      argument: id("b")
    }),
  "f x*3": () =>
    expr({
      kind: "BinaryExpression",
      op: "Multiply",
      left: fixture["f x"](),
      right: num(3)
    }),
  "f (1+2)": () =>
    expr({
      kind: "FunctionApplication",
      callee: id("f"),
      argument: fixture["1+2"]()
    })
};

describe(parse, () => {
  Object.keys(fixture).forEach(input => {
    test(`parse: "${input}"`, () => {
      const expectedNode = (fixture as Record<string, () => ExpressionNode>)[
        input
      ]();
      expect(parse(input)).toEqual(expectedNode);
    });
  });
});
