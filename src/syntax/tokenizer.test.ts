import { integerToken, decimalToken, variableToken, keywordToken } from "./tokenizer";
import { Scanner } from "../parser-util";
import { Token } from "./types";

test(integerToken.name, () => {
  expect(integerToken(new Scanner("0")).unwrap()).toMatchObject<Token>({
    tokenKind: "Integer",
    value: 0,
  });
  expect(integerToken(new Scanner("01")).unwrap()).toMatchObject<Token>({
    tokenKind: "Integer",
    value: 1,
  });
  expect(integerToken(new Scanner("20")).unwrap()).toMatchObject<Token>({
    tokenKind: "Integer",
    value: 20,
  });
});

test(decimalToken.name, () => {
  expect(decimalToken(new Scanner("0.")).unwrap()).toMatchObject<Omit<Token, "value">>({
    tokenKind: "Float",
  });
  expect(decimalToken(new Scanner("01.")).unwrap()).toMatchObject<Omit<Token, "value">>({
    tokenKind: "Float",
  });
  expect(decimalToken(new Scanner("2.0")).unwrap()).toMatchObject<Omit<Token, "value">>({
    tokenKind: "Float",
  });
  expect(Math.floor(decimalToken(new Scanner("2.0")).unwrap().value)).toBe(2);
});

test(keywordToken.name, () => {
  expect(keywordToken("true")(new Scanner("true")).unwrap()).toMatchObject<Token>({
    tokenKind: "Keyword",
    keyword: "true",
  });
  expect(keywordToken("true")(new Scanner("true1")).ok).toBeFalsy();
});

test(variableToken.name, () => {
  expect(variableToken(new Scanner("_'")).unwrap()).toMatchObject<Token>({
    tokenKind: "Variable",
    name: "_'",
  });
  expect(variableToken(new Scanner("hoge fuga")).unwrap()).toMatchObject<Token>({
    tokenKind: "Variable",
    name: "hoge",
  });
});
