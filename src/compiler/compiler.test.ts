import { parse } from "../syntax";
import { generateBinary } from "../wasm";
import { compile } from "./compiler";

describe(compile, () => {
  describe("literal", () => {
    it("should comiple number literal", async () => {
      expect(await evaluateMain("0")).toBe(0);
      expect(await evaluateMain("1")).toBe(1);
      expect(await evaluateMain("true")).toBe(1);
      expect(await evaluateMain("false")).toBe(0);
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
    });

    it("should treat association correctly", async () => {
      expect(await evaluateMain("1+2*3")).toBe(7);
      expect(await evaluateMain("(1+2)*3")).toBe(9);
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
});

const compile2wasm = (code: string) => parse(code).mapValue(compile).mapValue(generateBinary).unwrap();

const evaluateMain = async (code: string) => {
  const source = compile2wasm(code);
  const { instance } = await WebAssembly.instantiate(source, {});
  return (instance.exports["main"] as Function)();
};
