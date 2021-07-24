import { parse } from "../syntax";
import { ok } from "../structure";
import { TypeValue, getPrimaryType } from "../type-checker";
import { generateBinary } from "../wasm";
import { compile } from "./compiler";
import { toNumber, toFloat, toBoolean, toListAnd, toList } from "./js-bindings";
import { CompileNodeOptions } from "./types";

describe(compile, () => {
  describe("literal", () => {
    it("should comiple int literal", async () => {
      expect(await evaluateMain("0", toNumber)).toBe(0);
      expect(await evaluateMain("1", toNumber)).toBe(1);
    });

    it("should comiple float literal", async () => {
      expect(await evaluateMain("1.0", toFloat)).toBe(1.0);
    });

    it("should comiple bool literal", async () => {
      expect(await evaluateMain("true", toBoolean)).toBe(true);
      expect(await evaluateMain("false", toBoolean)).toBe(false);
    });

    it("should comiple empty list as 0", async () => {
      expect(await evaluateMain("[]", toList)).toEqual([]);
    });
  });

  describe("unary expression", () => {
    it("should compile integer minus operation", async () => {
      expect(await evaluateMain("-1", toNumber)).toBe(-1);
    });
    it("should compile floating minus operation", async () => {
      expect(await evaluateMain("-.1.", toFloat)).toBe(-1);
    });
  });

  describe("binary expression", () => {
    it("should compile integer arithmetic operations", async () => {
      expect(await evaluateMain("1+1")).toBe(2);
      expect(await evaluateMain("1-2")).toBe(-1);
      expect(await evaluateMain("1*3")).toBe(3);
      expect(await evaluateMain("4/2")).toBe(2);
    });

    it("should compile floating number arithmetic operations", async () => {
      expect(await evaluateMain("1.0 +. 1.0", toFloat)).toBe(2.0);
      expect(await evaluateMain("1.0 -. 2.0", toFloat)).toBe(-1.0);
      expect(await evaluateMain("1.0 *. 3.0", toFloat)).toBe(3.0);
      expect(await evaluateMain("4.0 /. 2.0", toFloat)).toBe(2.0);
    });

    it("should compile floating number arithmetic operations with optimization", async () => {
      expect(await evaluateMain("1.0 +. 1.0 +. 2.0", toFloat, { reduceInstructions: true })).toBe(4.0);
    });

    it("should compile compare operation without optimization", async () => {
      expect(await evaluateMain("0<1", toBoolean)).toBe(true);
      expect(await evaluateMain("0.<1.", toBoolean)).toBe(true);
      expect(await evaluateMain("false < true", toBoolean)).toBe(true);
      expect(await evaluateMain("[] < false::[]", toBoolean)).toBe(true);
    });

    it("should compile compare operation with optimization", async () => {
      expect(await evaluateMain("0<1", toBoolean, { dispatchUsingInferredType: true })).toBe(true);
      expect(await evaluateMain("0.<1.", toBoolean, { dispatchUsingInferredType: true })).toBe(true);
      expect(await evaluateMain("false < true", toBoolean, { dispatchUsingInferredType: true })).toBe(true);
      expect(await evaluateMain("[] < false::[]", toBoolean, { dispatchUsingInferredType: true })).toBe(true);
    });

    it("should compile logical operation", async () => {
      expect(await evaluateMain("true || true", toBoolean)).toBe(true);
      expect(await evaluateMain("true || false", toBoolean)).toBe(true);
      expect(await evaluateMain("false || true", toBoolean)).toBe(true);
      expect(await evaluateMain("false || false", toBoolean)).toBe(false);
      expect(await evaluateMain("true && true", toBoolean)).toBe(true);
      expect(await evaluateMain("true && false", toBoolean)).toBe(false);
      expect(await evaluateMain("false && true", toBoolean)).toBe(false);
      expect(await evaluateMain("false && false", toBoolean)).toBe(false);
    });

    it("should compile physical equality", async () => {
      expect(await evaluateMain("0==0", toBoolean)).toBe(true);
      expect(await evaluateMain("0==1", toBoolean)).toBe(false);
      expect(await evaluateMain("0!=0", toBoolean)).toBe(false);
      expect(await evaluateMain("0!=1", toBoolean)).toBe(true);
      expect(await evaluateMain("true==true", toBoolean)).toBe(true);
      expect(await evaluateMain("true==false", toBoolean)).toBe(false);
      expect(await evaluateMain("false!=false", toBoolean)).toBe(false);
      expect(await evaluateMain("false!=true", toBoolean)).toBe(true);
      expect(await evaluateMain("[]==[]", toBoolean)).toBe(true);
      expect(await evaluateMain("[]!=[]", toBoolean)).toBe(false);
      expect(await evaluateMain("(fun x -> 10) == (fun x -> 10)", toBoolean)).toBe(false);
      expect(await evaluateMain("let fn = fun x -> 10 in fn == fn", toBoolean)).toBe(true);
      expect(await evaluateMain("(fun x -> 10) != (fun x -> 10)", toBoolean)).toBe(true);
      expect(await evaluateMain("let fn = fun x -> 10 in fn != fn", toBoolean)).toBe(false);
    });

    it("should treat association correctly", async () => {
      expect(await evaluateMain("1+2*3")).toBe(7);
      expect(await evaluateMain("(1+2)*3")).toBe(9);
    });
  });

  describe("list constructor", () => {
    it("shuld compile list construction", async () => {
      expect(await evaluateMain("1::[]", toListAnd(toNumber))).toEqual([1]);
      expect(await evaluateMain("1::2::[]", toListAnd(toNumber))).toEqual([1, 2]);
      expect(await evaluateMain("true::false::[]", toListAnd(toBoolean))).toEqual([true, false]);
    });
  });

  describe("if expression", () => {
    it("should compile if expressoin", async () => {
      expect(await evaluateMain("if true then 0 else 1")).toBe(0);
      expect(await evaluateMain("if false then 0 else 1")).toBe(1);
    });
  });

  describe("match expression", () => {
    it("should compile pattern match expression", async () => {
      expect(await evaluateMain("match 1::[] with [] -> false | x::y -> y", toList)).toEqual([]);
      expect(await evaluateMain("match 1::2::[] with x::y::z -> y")).toBe(2);
      expect(await evaluateMain("match 1::2::[] with x::y::z -> z", toList)).toEqual([]);
      expect(await evaluateMain("match 0 with _ -> true", toBoolean)).toBe(true);
    });
  });

  describe("variable bindings", () => {
    it("should compile let expression and identifier", async () => {
      expect(await evaluateMain("let a = 1 in a")).toBe(1);
    });

    it("should compile variable index correctly", async () => {
      expect(await evaluateMain("let a = 2 in (let b = 10 in a + b) * a")).toBe(24);
    });
  });

  describe("function definition and application", () => {
    it("should compile function application and evaluate correctly", async () => {
      expect(await evaluateMain("(fun x -> 10)(1)")).toBe(10);
      expect(await evaluateMain("let add = fun a -> fun b -> a + b in add 10 20")).toBe(30);
    });
    it("should compile recursive function application and evaluate correctly", async () => {
      expect(await evaluateMain("let rec add = fun a -> fun b -> a + b in add 10 20")).toBe(30);
      expect(await evaluateMain("let rec fact = fun n -> if n < 1 then 1 else n * fact (n - 1) in fact 3")).toBe(6);
    });
  });

  describe("complex example", () => {
    test("list length", async () => {
      const code = `
        let rec ln = fun list  ->
          match list with [] -> 0 | x::y -> 1 + ln y in
        let l = 1::2::3::4::[] in
        ln l
      `;
      expect(await evaluateMain(code)).toBe(4);
    });

    test("mapping list", async () => {
      const code = `
        let twice = fun x -> x * 2 in
        let rec map = fun f -> fun list -> match list with [] -> [] | x::y -> (f x)::(map f y) in
        map twice (1::2::3::[])
      `;
      expect(await evaluateMain(code, toListAnd(toNumber))).toEqual([2, 4, 6]);
    });

    test("factorial for list", async () => {
      const code = `
        let rec fact = fun n -> if n < 2 then 1 else n * fact(n - 1) in
        let rec range = fun s -> fun e -> if s >= e then [] else s::(range (s + 1) e) in
        let rec map = fun f -> fun list -> match list with [] -> [] | x::y -> (f x)::(map f y) in
        map fact (range 1 7)
      `;
      expect(await evaluateMain(code, toListAnd(toNumber))).toEqual([1, 2, 6, 24, 120, 720]);
    });
  });
});

const compile2wasm = (code: string, { dispatchUsingInferredType }: Omit<CompileNodeOptions, "typeValueMap">) =>
  parse(code)
    .mapValue(ast => {
      if (!dispatchUsingInferredType) {
        return ok({ ast, typeValueMap: new Map<string, TypeValue>() });
      } else {
        return getPrimaryType(ast).map(({ typeValueMap }) => ({ ast, typeValueMap }));
      }
    })
    .mapValue(({ ast, typeValueMap }) => compile(ast, { dispatchUsingInferredType, typeValueMap }))
    .mapValue(mod => generateBinary(mod, { enableNameSection: false }))
    .unwrap();

const evaluateMain = async (
  code: string,
  converter: (instance: WebAssembly.Instance, value: number) => any = toNumber,
  options: Omit<CompileNodeOptions, "typeValueMap"> = {
    dispatchUsingInferredType: false,
    reduceInstructions: false,
  },
) => {
  const source = compile2wasm(code, options);
  const { instance } = await WebAssembly.instantiate(source, {});
  const v = (instance.exports["main"] as Function)() as number;
  return converter(instance, v);
};
