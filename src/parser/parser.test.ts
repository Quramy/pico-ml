import { parse } from "./parser";
import {
  ExpressionNode,
  NumberLiteralNode,
  AddOperation,
  MultiplyOperation,
  BoolLiteralNode,
  IdentifierNode,
  LessThanOperation,
  SubOperation,
} from "./types";

const num = (value: number) =>
  ({
    kind: "NumberLiteral",
    value,
  } as NumberLiteralNode);

const add: AddOperation = {
  kind: "Add",
  token: {
    tokenKind: "Plus",
  },
};

const sub: SubOperation = {
  kind: "Sub",
  token: {
    tokenKind: "Minus",
  },
};

const multiply: MultiplyOperation = {
  kind: "Multiply",
  token: {
    tokenKind: "Times",
  },
};

const lessThan: LessThanOperation = {
  kind: "LessThan",
  token: {
    tokenKind: "LessThan",
  },
};

const bool = (value: boolean) =>
  ({
    kind: "BoolLiteral",
    value,
  } as BoolLiteralNode);

const id = (name: string) => ({ kind: "Identifier", name } as IdentifierNode);

const expr = <T extends ExpressionNode = ExpressionNode>(node: T) => node;

const fixture = {
  "0": () => num(0),
  true: () => bool(true),
  false: () => bool(false),
  "1+2": () =>
    expr({
      kind: "BinaryExpression",
      op: add,
      left: num(1),
      right: num(2),
    }),
  "(1+2)*3": () =>
    expr({
      kind: "BinaryExpression",
      op: multiply,
      left: fixture["1+2"](),
      right: num(3),
    }),
  "if true then 0 else 1": () =>
    expr({
      kind: "IfExpression",
      cond: bool(true),
      then: num(0),
      else: num(1),
    }),
  "if true then 0 else 1 + if true then 0 else 1": () =>
    expr({
      kind: "IfExpression",
      cond: bool(true),
      then: num(0),
      else: {
        kind: "BinaryExpression",
        op: add,
        left: num(1),
        right: fixture["if true then 0 else 1"](),
      },
    }),
  "(if true then 0 else 1) + if true then 0 else 1": () =>
    expr({
      kind: "BinaryExpression",
      op: add,
      left: fixture["if true then 0 else 1"](),
      right: fixture["if true then 0 else 1"](),
    }),
  "let x = 1 + 2 in x": () =>
    expr({
      kind: "LetExpression",
      identifier: id("x"),
      binding: fixture["1+2"](),
      exp: id("x"),
    }),
  "fun x -> 1": () =>
    expr({
      kind: "FunctionDefinition",
      param: id("x"),
      body: num(1),
    }),
  "fun x -> if true then 0 else 1": () =>
    expr({
      kind: "FunctionDefinition",
      param: id("x"),
      body: fixture["if true then 0 else 1"](),
    }),
  "fun f -> if true then fun x -> 1 else fun x -> 1": () =>
    expr({
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
      argument: id("x"),
    }),
  "f a b": () =>
    expr({
      kind: "FunctionApplication",
      callee: {
        kind: "FunctionApplication",
        callee: id("f"),
        argument: id("a"),
      },
      argument: id("b"),
    }),
  "f x*3": () =>
    expr({
      kind: "BinaryExpression",
      op: multiply,
      left: fixture["f x"](),
      right: num(3),
    }),
  "f (1+2)": () =>
    expr({
      kind: "FunctionApplication",
      callee: id("f"),
      argument: fixture["1+2"](),
    }),
  "let rec f = fun x -> 1 in f": () =>
    expr({
      kind: "LetRecExpression",
      identifier: id("f"),
      binding: fixture["fun x -> 1"](),
      exp: id("f"),
    }),
  "let rec fib = fun n -> if n < 2 then n else fib (n - 1) + fib (n -2) in fib 10": () =>
    expr({
      kind: "LetRecExpression",
      identifier: id("fib"),
      binding: {
        kind: "FunctionDefinition",
        param: id("n"),
        body: {
          kind: "IfExpression",
          cond: {
            kind: "BinaryExpression",
            op: lessThan,
            left: id("n"),
            right: num(2),
          },
          then: id("n"),
          else: {
            kind: "BinaryExpression",
            op: add,
            left: {
              kind: "FunctionApplication",
              callee: id("fib"),
              argument: {
                kind: "BinaryExpression",
                op: sub,
                left: id("n"),
                right: num(1),
              },
            },
            right: {
              kind: "FunctionApplication",
              callee: id("fib"),
              argument: {
                kind: "BinaryExpression",
                op: sub,
                left: id("n"),
                right: num(2),
              },
            },
          },
        },
      },
      exp: {
        kind: "FunctionApplication",
        callee: id("fib"),
        argument: num(10),
      },
    }),
};

describe(parse, () => {
  Object.keys(fixture).forEach(input => {
    test(`parse: "${input}"`, () => {
      const expectedNode = (fixture as Record<string, () => ExpressionNode>)[input]();
      expect(parse(input)).toMatchObject(expectedNode);
    });
  });
});
