import { tokenize, Tokens } from "./tokenizer";

describe(tokenize, () => {
  test("tokenize", () => {
    expect(tokenize("1")).toEqual<Tokens>([{ tokenKind: "Number", value: 1 }]);
    expect(tokenize("100 200")).toEqual<Tokens>([
      { tokenKind: "Number", value: 100 },
      { tokenKind: "Number", value: 200 }
    ]);
    expect(tokenize("001 002")).toEqual<Tokens>([
      { tokenKind: "Number", value: 1 },
      { tokenKind: "Number", value: 2 }
    ]);
    expect(tokenize("*+-<")).toEqual<Tokens>([
      { tokenKind: "Times" },
      { tokenKind: "Plus" },
      { tokenKind: "Minus" },
      { tokenKind: "LessThan" }
    ]);
    expect(tokenize("if true then true else false")).toEqual<Tokens>([
      { tokenKind: "If" },
      { tokenKind: "Boolean", value: true },
      { tokenKind: "Then" },
      { tokenKind: "Boolean", value: true },
      { tokenKind: "Else" },
      { tokenKind: "Boolean", value: false }
    ]);
    expect(tokenize("let x = 1 in x")).toEqual<Tokens>([
      { tokenKind: "Let" },
      { tokenKind: "Variable", value: "x" },
      { tokenKind: "Equal" },
      { tokenKind: "Number", value: 1 },
      { tokenKind: "In" },
      { tokenKind: "Variable", value: "x" }
    ]);
    expect(tokenize("fun x -> x")).toEqual<Tokens>([
      { tokenKind: "Fun" },
      { tokenKind: "Variable", value: "x" },
      { tokenKind: "RightArrow" },
      { tokenKind: "Variable", value: "x" }
    ]);
    expect(() => tokenize("#")).toThrowError();
  });
});
