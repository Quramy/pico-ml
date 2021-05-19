import { parse } from "../syntax";
import { generateBinary } from "../wasm";
import { compile } from "./compiler";
import { toNumber, toBoolean, toList } from "./js-bindings";

describe(compile, () => {
  describe("literal", () => {
    it("should comiple int literal", async () => {
      expect(await evaluateMain("0")).toBe(0);
      expect(await evaluateMain("1")).toBe(1);
    });

    it("should comiple bool literal as 1 or 0", async () => {
      expect(await evaluateMain("true")).toBe(1);
      expect(await evaluateMain("false")).toBe(0);
    });

    it("should comiple empty list as 0", async () => {
      expect(await evaluateMain("[]", toList)).toEqual([]);
    });
  });

  describe("unary expression", () => {
    it("should compile minus operation", async () => {
      expect(await evaluateMain("-1")).toBe(-1);
      expect(await evaluateMain("-true")).toBe(-1);
    });
  });

  describe("binary expression", () => {
    it("should compile arithmetic operations", async () => {
      expect(await evaluateMain("1+1")).toBe(2);
      expect(await evaluateMain("1-2")).toBe(-1);
      expect(await evaluateMain("1*3")).toBe(3);
    });

    it("should compile numeric compare operation", async () => {
      expect(await evaluateMain("1>0", toBoolean)).toBe(true);
      expect(await evaluateMain("1>1", toBoolean)).toBe(false);
      expect(await evaluateMain("1>2", toBoolean)).toBe(false);
      expect(await evaluateMain("0<1", toBoolean)).toBe(true);
      expect(await evaluateMain("1<1", toBoolean)).toBe(false);
      expect(await evaluateMain("2<1", toBoolean)).toBe(false);
      expect(await evaluateMain("1>=0", toBoolean)).toBe(true);
      expect(await evaluateMain("1>=1", toBoolean)).toBe(true);
      expect(await evaluateMain("1>=2", toBoolean)).toBe(false);
      expect(await evaluateMain("0<=1", toBoolean)).toBe(true);
      expect(await evaluateMain("1<=1", toBoolean)).toBe(true);
      expect(await evaluateMain("2<=1", toBoolean)).toBe(false);
    });

    it("should compile equality", async () => {
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
      expect(await evaluateMain("1::[]", toList)).toEqual([1]);
      expect(await evaluateMain("1::2::[]", toList)).toEqual([1, 2]);
      expect(await evaluateMain("true::false::[]", toList)).toEqual([1, 0]);
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
      expect(await evaluateMain(code, toList)).toEqual([2, 4, 6]);
    });

    test("factorial for list", async () => {
      const code = `
        let rec fact = fun n -> if n < 2 then 1 else n * fact(n - 1) in
        let rec range = fun s -> fun e -> if s >= e then [] else s::(range (s + 1) e) in
        let rec map = fun f -> fun list -> match list with [] -> [] | x::y -> (f x)::(map f y) in
        map fact (range 1 7)
      `;
      expect(await evaluateMain(code, toList)).toEqual([1, 2, 6, 24, 120, 720]);
    });
  });
});

const compile2wasm = (code: string) =>
  parse(code)
    .mapValue(compile)
    .mapValue(mod => generateBinary(mod, { enabledNameSection: false }))
    .unwrap();

const evaluateMain = async (
  code: string,
  converter: (instance: WebAssembly.Instance, value: number) => any = toNumber,
) => {
  const source = compile2wasm(code);
  const { instance } = await WebAssembly.instantiate(source, {});
  const v = (instance.exports["main"] as Function)() as number;
  return converter(instance, v);
};
