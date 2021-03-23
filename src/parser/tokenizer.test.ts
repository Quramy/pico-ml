import { unwrap } from "../structure";
import { numberToken, variableToken, keywordToken } from "./tokenizer";
import { Scanner } from "./scanner";
import { Token } from "./types";

test(numberToken.name, () => {
  expect(unwrap(numberToken(new Scanner("0")))).toMatchObject<Token>({
    tokenKind: "Number",
    value: 0,
  });
  expect(unwrap(numberToken(new Scanner("01")))).toMatchObject<Token>({
    tokenKind: "Number",
    value: 1,
  });
  expect(unwrap(numberToken(new Scanner("20")))).toMatchObject<Token>({
    tokenKind: "Number",
    value: 20,
  });
});

test(keywordToken.name, () => {
  expect(unwrap(keywordToken("true")(new Scanner("true")))).toMatchObject<Token>({
    tokenKind: "Keyword",
    keyword: "true",
  });
  expect(keywordToken("true")(new Scanner("true1")).ok).toBeFalsy();
});

test(variableToken.name, () => {
  expect(unwrap(variableToken(new Scanner("_'")))).toMatchObject<Token>({
    tokenKind: "Variable",
    name: "_'",
  });
  expect(unwrap(variableToken(new Scanner("hoge fuga")))).toMatchObject<Token>({
    tokenKind: "Variable",
    name: "hoge",
  });
});
