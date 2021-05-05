import { parse } from "../syntax";
import { generateBinary } from "../wasm";
import { compile } from "./compiler";

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
      expect(await evaluateMain("[]")).toBe(0);
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
      expect(await evaluateMain("1>0")).toBe(1);
      expect(await evaluateMain("1>1")).toBe(0);
      expect(await evaluateMain("1>2")).toBe(0);
      expect(await evaluateMain("0<1")).toBe(1);
      expect(await evaluateMain("1<1")).toBe(0);
      expect(await evaluateMain("2<1")).toBe(0);
      expect(await evaluateMain("1>=0")).toBe(1);
      expect(await evaluateMain("1>=1")).toBe(1);
      expect(await evaluateMain("1>=2")).toBe(0);
      expect(await evaluateMain("0<=1")).toBe(1);
      expect(await evaluateMain("1<=1")).toBe(1);
      expect(await evaluateMain("2<=1")).toBe(0);
    });

    it("should compile equality", async () => {
      expect(await evaluateMain("0==0")).toBe(1);
      expect(await evaluateMain("0==1")).toBe(0);
      expect(await evaluateMain("0!=0")).toBe(0);
      expect(await evaluateMain("0!=1")).toBe(1);
      expect(await evaluateMain("true==true")).toBe(1);
      expect(await evaluateMain("true==false")).toBe(0);
      expect(await evaluateMain("false!=false")).toBe(0);
      expect(await evaluateMain("false!=true")).toBe(1);
      expect(await evaluateMain("[]==[]")).toBe(1);
      expect(await evaluateMain("[]!=[]")).toBe(0);
      expect(await evaluateMain("(fun x -> 10) == (fun x -> 10)")).toBe(0);
      expect(await evaluateMain("let fn = fun x -> 10 in fn == fn")).toBe(1);
      expect(await evaluateMain("(fun x -> 10) != (fun x -> 10)")).toBe(1);
      expect(await evaluateMain("let fn = fun x -> 10 in fn != fn")).toBe(0);
    });

    it("should treat association correctly", async () => {
      expect(await evaluateMain("1+2*3")).toBe(7);
      expect(await evaluateMain("(1+2)*3")).toBe(9);
    });
  });

  describe("if expression", () => {
    it("should compile if expressoin", async () => {
      expect(await evaluateMain("if true then 0 else 1")).toBe(0);
      expect(await evaluateMain("if false then 0 else 1")).toBe(1);
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
});

const compile2wasm = (code: string) => parse(code).mapValue(compile).mapValue(generateBinary).unwrap();

const evaluateMain = async (code: string) => {
  const source = compile2wasm(code);
  const { instance } = await WebAssembly.instantiate(source, {});
  return (instance.exports["main"] as Function)();
};
