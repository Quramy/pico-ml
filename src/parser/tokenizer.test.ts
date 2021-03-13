import { numberToken, variableToken, keywordToken } from "./tokenizer";
import { Scanner } from "./scanner";
import { Token } from "./types";

test(numberToken.name, () => {
  expect(numberToken(new Scanner("0"))).toMatchObject<Token>({
    tokenKind: "Number",
    value: 0,
  });
  expect(numberToken(new Scanner("01"))).toMatchObject<Token>({
    tokenKind: "Number",
    value: 1,
  });
  expect(numberToken(new Scanner("20"))).toMatchObject<Token>({
    tokenKind: "Number",
    value: 20,
  });
});

test(keywordToken.name, () => {
  expect(keywordToken("true")(new Scanner("true"))).toMatchObject<Token>({
    tokenKind: "Keyword",
    keyword: "true",
  });
  expect(keywordToken("true")(new Scanner("true1"))).toBeFalsy();
});

test(variableToken.name, () => {
  expect(variableToken(new Scanner("hoge fuga"))).toMatchObject<Token>({
    tokenKind: "Variable",
    name: "hoge",
  });
});
