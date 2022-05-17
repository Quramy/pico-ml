import { ParseValue, Parser, Scanner } from "../../parser-util";
import {
  parseType,
  parseFuncSig,
  parseModule,
  parseMemory,
  parseIfInstr,
  parseControlInstr,
  parseVariableInstr,
  parseNumericInstr,
  parseFunc,
  parseExport,
  parseMemoryInstr,
  parseElem,
  parseTable,
  parseGlobal,
} from "./parser";
import * as f from "./ast-factory";
import { InstructionNode } from "../ast-types";

describe(parseFuncSig.name, () => {
  test("success", () => {
    expect(use(parseFuncSig)("(type 1)")).toMatchObject(f.funcSig([], [], f.uint32(1)));
    expect(use(parseFuncSig)("(type $fn)")).toMatchObject(f.funcSig([], [], f.identifier("fn")));
    expect(use(parseFuncSig)("(param i32)")).toMatchObject(f.funcSig([f.paramType(f.valueType("i32"))], []));
    expect(use(parseFuncSig)("(result i32)")).toMatchObject(f.funcSig([], [f.valueType("i32")]));
  });
});

describe(parseIfInstr.name, () => {
  const instr = f.int32NumericInstr("i32.const", [f.int32(0)]);
  test("success", () => {
    expect(use(parseIfInstr)("if (result i32) i32.const 0 else i32.const 0 end")).toMatchObject(
      f.ifInstr(f.blockType([f.valueType("i32")]), [instr], [instr]),
    );
    expect(use(parseIfInstr)("if (type $result) i32.const 0 else i32.const 0 end")).toMatchObject(
      f.ifInstr(f.blockType([], f.identifier("result")), [instr], [instr]),
    );
    expect(use(parseIfInstr)("if $a (result i32) i32.const 0 else $a i32.const 0 end $a")).toMatchObject(
      f.ifInstr(f.blockType([f.valueType("i32")]), [instr], [instr], f.identifier("a")),
    );
    expect(
      use(parseIfInstr)("if (result i32) if (result i32) i32.const 0 else i32.const 0 end else i32.const 0 end"),
    ).toMatchObject(
      f.ifInstr(
        f.blockType([f.valueType("i32")]),
        [f.ifInstr(f.blockType([f.valueType("i32")]), [instr], [instr])],
        [instr],
      ),
    );
  });
});

describe(parseControlInstr.name, () => {
  test("success", () => {
    expect(use(parseControlInstr)("call 0")).toMatchObject(f.controlInstr("call", [f.uint32(0)]));
    expect(use(parseControlInstr)("call_indirect 0 (type 1)")).toMatchObject(
      f.controlInstr("call_indirect", [f.uint32(0), f.funcTypeRef(f.uint32(1))]),
    );
  });
});

describe(parseVariableInstr.name, () => {
  test("success", () => {
    expect(use(parseVariableInstr)("local.get 0")).toMatchObject(f.variableInstr("local.get", [f.uint32(0)]));
    expect(use(parseVariableInstr)("local.set $var")).toMatchObject(
      f.variableInstr("local.set", [f.identifier("var")]),
    );
  });
});

describe(parseNumericInstr.name, () => {
  test("success", () => {
    expect(use(parseNumericInstr)("i32.const 0")).toMatchObject(f.int32NumericInstr("i32.const", [f.int32(0)]));
  });
  test("success", () => {
    expect(use(parseNumericInstr)("i64.const 0")).toMatchObject(f.int64NumericInstr("i64.const", [f.int64(0)]));
  });
  test("success", () => {
    expect(use(parseNumericInstr)("f32.const 0")).toMatchObject(f.float32NumericInstr("f32.const", [f.float32(0)]));
  });
  test("success", () => {
    expect(use(parseNumericInstr)("f64.const 0")).toMatchObject(f.float64NumericInstr("f64.const", [f.float64(0)]));
  });
});

describe(parseMemoryInstr.name, () => {
  test("success", () => {
    expect(use(parseMemoryInstr)("i32.load")).toMatchObject(f.memoryInstr("i32.load"));
    expect(use(parseMemoryInstr)("i32.load offset=0")).toMatchObject(f.memoryInstr("i32.load", f.uint32(0)));
    expect(use(parseMemoryInstr)("i32.load align=4")).toMatchObject(f.memoryInstr("i32.load", null, f.uint32(4)));
  });
});

describe(parseType.name, () => {
  test("success", () => {
    expect(use(parseType)("(type (func))")).toMatchObject(f.typedef(f.funcType([], [])));
    expect(use(parseType)("(type (func (param i32)))")).toMatchObject(
      f.typedef(f.funcType([f.paramType(f.valueType("i32"))], [])),
    );
    expect(use(parseType)("(type (func (param i64)))")).toMatchObject(
      f.typedef(f.funcType([f.paramType(f.valueType("i64"))], [])),
    );
    expect(use(parseType)("(type (func (param f32)))")).toMatchObject(
      f.typedef(f.funcType([f.paramType(f.valueType("f32"))], [])),
    );
    expect(use(parseType)("(type (func (param f64)))")).toMatchObject(
      f.typedef(f.funcType([f.paramType(f.valueType("f64"))], [])),
    );
    expect(use(parseType)("(type (func (result i32)))")).toMatchObject(f.typedef(f.funcType([], [f.valueType("i32")])));
    expect(use(parseType)("(type (func (result i64)))")).toMatchObject(f.typedef(f.funcType([], [f.valueType("i64")])));
    expect(use(parseType)("(type (func (result f32)))")).toMatchObject(f.typedef(f.funcType([], [f.valueType("f32")])));
    expect(use(parseType)("(type (func (result f64)))")).toMatchObject(f.typedef(f.funcType([], [f.valueType("f64")])));
    expect(use(parseType)("(type (func (param i32) (result i32)))")).toMatchObject(
      f.typedef(f.funcType([f.paramType(f.valueType("i32"))], [f.valueType("i32")])),
    );
    expect(use(parseType)("(type (func (param $a i32) (param $b i32) (result i32)))")).toMatchObject(
      f.typedef(
        f.funcType(
          [f.paramType(f.valueType("i32"), f.identifier("a")), f.paramType(f.valueType("i32"), f.identifier("b"))],
          [f.valueType("i32")],
        ),
      ),
    );
    expect(use(parseType)("(type $fn (func))")).toMatchObject(f.typedef(f.funcType([], []), f.identifier("fn")));
  });
});

describe(parseFunc.name, () => {
  test("success", () => {
    expect(use(parseFunc)("(func)")).toMatchObject(f.func(f.funcSig([], []), [], []));
    expect(use(parseFunc)("(func (result i64))")).toMatchObject(f.func(f.funcSig([], [f.valueType("i64")]), [], []));
    expect(use(parseFunc)("(func (result i32) i32.const 100)")).toMatchObject(
      f.func(f.funcSig([], [f.valueType("i32")]), [], [f.int32NumericInstr("i32.const", [f.int32(100)])]),
    );
    expect(
      use(parseFunc)(
        `(func $add (param $a i32) (param $b i32) (result i32)
         local.get $a
         local.get $b
         i32.add
       )`,
      ),
    ).toMatchObject(
      f.func(
        f.funcSig(
          [f.paramType(f.valueType("i32"), f.identifier("a")), f.paramType(f.valueType("i32"), f.identifier("b"))],
          [f.valueType("i32")],
        ),
        [],
        [
          f.variableInstr("local.get", [f.identifier("a")]),
          f.variableInstr("local.get", [f.identifier("b")]),
          f.int32NumericInstr("i32.add", []),
        ],
        f.identifier("add"),
      ),
    );
    expect(use(parseFunc)("(func %%PLACEHOLDER_0%%)")).toMatchObject(
      f.func(f.funcSig([], []), [], [f.syntacticPlaceholder<InstructionNode>(0)]),
    );
  });
});

describe(parseTable.name, () => {
  test("success", () => {
    expect(use(parseTable)("(table funcref (elem 1))")).toMatchObject(
      f.tableWithElemList(f.functionIndexList([f.uint32(1)])),
    );
    expect(use(parseTable)("(table $table funcref (elem 1 3))")).toMatchObject(
      f.tableWithElemList(f.functionIndexList([f.uint32(1), f.uint32(3)]), f.identifier("table")),
    );
    expect(use(parseTable)("(table 1 funcref)")).toMatchObject(
      f.tableWithType(f.tableType(f.refType("Funcref"), f.limits(f.uint32(1)))),
    );
    expect(use(parseTable)("(table $table 1 2 funcref)")).toMatchObject(
      f.tableWithType(f.tableType(f.refType("Funcref"), f.limits(f.uint32(1), f.uint32(2))), f.identifier("table")),
    );
  });
});

describe(parseMemory.name, () => {
  test("success", () => {
    expect(use(parseMemory)("(memory 1)")).toMatchObject(f.memory(f.limits(f.uint32(1))));
    expect(use(parseMemory)("(memory 1 2)")).toMatchObject(f.memory(f.limits(f.uint32(1), f.uint32(2))));
    expect(use(parseMemory)("(memory $mem 1)")).toMatchObject(f.memory(f.limits(f.uint32(1)), f.identifier("mem")));
    expect(use(parseMemory)("(memory $mem 1 2)")).toMatchObject(
      f.memory(f.limits(f.uint32(1), f.uint32(2)), f.identifier("mem")),
    );
  });
});

describe(parseGlobal.name, () => {
  test("success", () => {
    expect(use(parseGlobal)("(global i32 i32.const 0)")).toMatchObject(
      f.globalNode(f.valueType("i32"), [f.int32NumericInstr("i32.const", [f.int32(0)])]),
    );
    expect(use(parseGlobal)("(global $g (mut i32) i32.const 0)")).toMatchObject(
      f.globalNode(
        f.mutValueType(f.valueType("i32")),
        [f.int32NumericInstr("i32.const", [f.int32(0)])],
        f.identifier("g"),
      ),
    );
  });
});

describe(parseExport.name, () => {
  test("success", () => {
    expect(use(parseExport)('(export "main" (func $main))')).toMatchObject(
      f.exportNode("main", f.exportedFunc(f.identifier("main"))),
    );
    expect(use(parseExport)('(export "main" (memory $main))')).toMatchObject(
      f.exportNode("main", f.exportedMemory(f.identifier("main"))),
    );
    expect(use(parseExport)('(export "main" (table $main))')).toMatchObject(
      f.exportNode("main", f.exportedTable(f.identifier("main"))),
    );
    expect(use(parseExport)('(export "main" (global $main))')).toMatchObject(
      f.exportNode("main", f.exportedGlobal(f.identifier("main"))),
    );
  });
});

describe(parseElem.name, () => {
  test("success", () => {
    expect(use(parseElem)("(elem (offset i32.const 0) func 0)")).toMatchObject(
      f.elem(f.functionIndexList([f.uint32(0)]), [f.int32NumericInstr("i32.const", [f.int32(0)])]),
    );
  });
});

describe(parseModule.name, () => {
  const mem = f.memory(f.limits(f.uint32(1)));
  const typedef = f.typedef(f.funcType([], []));
  test("success", () => {
    expect(use(parseModule)("(module)")).toMatchObject(f.mod([]));
    expect(use(parseModule)("(module (memory 1))")).toMatchObject(f.mod([mem]));
    expect(use(parseModule)("(module (memory 1) (type (func)))")).toMatchObject(f.mod([mem, typedef]));
    expect(use(parseModule)("(module (func (result i32) i32.const 1))")).toMatchObject(
      f.mod([f.func(f.funcSig([], [f.valueType("i32")]), [], [f.int32NumericInstr("i32.const", [f.int32(1)])])]),
    );
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
  if (typeof obj === "boolean") return obj as any as T;
  if (typeof obj === "number") return obj as any as T;
  if (typeof obj === "string") return obj as any as T;
  if (Array.isArray(obj)) {
    return obj.map(item => normalize(item)) as any;
  }
  return Object.keys(obj).reduce((acc, k) => {
    if (k === "loc") return { ...acc, loc: undefined };
    return { ...acc, [k]: normalize((obj as any)[k] as T) };
  }, {}) as any as T;
}
