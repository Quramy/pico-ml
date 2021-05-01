import { Scanner } from "../../parser-util";
import { strToken } from "./tokenizer";
import { StringToken } from "../ast-types";

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
