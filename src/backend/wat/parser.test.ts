import { ParseValue, Parser, Scanner } from "../../parser-util";
import { parseModule, parseMemory } from "./parser";
import * as f from "../ast-factory";

describe(parseMemory, () => {
  test("success", () => {
    expect(use(parseMemory)("(memory 1)")).toMatchObject(f.memory(f.limits(f.uint32(1))));
    expect(use(parseMemory)("(memory 1 2)")).toMatchObject(f.memory(f.limits(f.uint32(1), f.uint32(2))));
    expect(use(parseMemory)("(memory $mem 1)")).toMatchObject(f.memory(f.limits(f.uint32(1)), f.identifier("mem")));
  });
});

describe(parseModule, () => {
  const mem = f.memory(f.limits(f.uint32(1)));
  test("success", () => {
    expect(use(parseModule)("(module)")).toMatchObject(f.mod([]));
    expect(use(parseModule)("(module (memory 1))")).toMatchObject(f.mod([mem]));
  });
});

function use<V extends ParseValue, T extends Parser<V>>(parser: T) {
  return (code: string) => {
    return parser(new Scanner(code)).map(normalize).unwrap();
  };
}

function normalize<T>(o: T): T {
  const obj = o as any;
  if (!obj) return obj as T;
  if (typeof obj === "boolean") return (obj as any) as T;
  if (typeof obj === "number") return (obj as any) as T;
  if (typeof obj === "string") return (obj as any) as T;
  if (Array.isArray(obj)) {
    return obj.map(item => normalize(item)) as any;
  }
  return (Object.keys(obj).reduce((acc, k) => {
    if (k === "loc") return { ...acc, loc: undefined };
    return { ...acc, [k]: normalize((obj as any)[k] as T) };
  }, {}) as any) as T;
}
