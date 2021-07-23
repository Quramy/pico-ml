import { Scanner } from "../../parser-util";
import { decimalToken, strToken, syntacticPlaceholder } from "./tokenizer";
import { StringToken, DecimalToken, SyntacticPlaceholderNode } from "../ast-types";

test(decimalToken.name, () => {
  expect(decimalToken(new Scanner("0")).unwrap()).toMatchObject<DecimalToken>({
    tokenKind: "Decimal",
    value: 0,
  });
  expect(decimalToken(new Scanner("0.")).unwrap()).toMatchObject<DecimalToken>({
    tokenKind: "Decimal",
    value: 0,
  });
  expect(decimalToken(new Scanner("0.1")).unwrap()).toMatchObject<DecimalToken>({
    tokenKind: "Decimal",
    value: 0.1,
  });
  expect(decimalToken(new Scanner("+0.1")).unwrap()).toMatchObject<DecimalToken>({
    tokenKind: "Decimal",
    value: 0.1,
  });
  expect(decimalToken(new Scanner("-0.1")).unwrap()).toMatchObject<DecimalToken>({
    tokenKind: "Decimal",
    value: -0.1,
  });
});

test(strToken.name, () => {
  expect(strToken(new Scanner('""')).unwrap()).toMatchObject<StringToken>({
    tokenKind: "String",
    value: "",
  });
  expect(strToken(new Scanner('"hoge"')).unwrap()).toMatchObject<StringToken>({
    tokenKind: "String",
    value: "hoge",
  });
  expect(strToken(new Scanner(`"ho\\"ge"`)).unwrap()).toMatchObject<StringToken>({
    tokenKind: "String",
    value: 'ho"ge',
  });
  expect(strToken(new Scanner(`"ho\\\\ge"`)).unwrap()).toMatchObject<StringToken>({
    tokenKind: "String",
    value: "ho\\ge",
  });
});

test(syntacticPlaceholder.name, () => {
  expect(syntacticPlaceholder(new Scanner("%%PLACEHOLDER_10%%")).unwrap()).toMatchObject<SyntacticPlaceholderNode>({
    kind: "SyntacticPlaceholder",
    index: 10,
  });
});
