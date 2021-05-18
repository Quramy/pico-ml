import {
  Module,
  Limits,
  MemType,
  FuncType,
  ValType,
  Func,
  Expr,
  Export,
  Instruction,
  BlockType,
  TableType,
  Elem,
  FunctionIndexList,
  Global,
  GlobalType,
  Names,
  NameAssociation,
  IndirectNameMap,
} from "../structure-types";
import { BinaryOutputOptions } from "../types";

import {
  variableInstructions,
  numericInstructions,
  controlInstructions,
  structuredInstructions,
  memoryInstructions,
} from "../instructions-map";

import { encodeUnsigned, encodeSigned } from "./leb";
import { encodeString } from "./str";

const magic = [0x00, 0x61, 0x73, 0x6d];
const version = [0x01, 0x00, 0x00, 0x00];

const exportTypes = {
  Func: 0x00,
  Table: 0x01,
  Memory: 0x02,
  Global: 0x03,
};

function uint32(value: number) {
  return encodeUnsigned(value);
}

function int32(value: number) {
  return encodeSigned(value);
}

function name(value: string) {
  const c = encodeString(value);
  return new Uint8Array([...uint32(c.byteLength), ...c]);
}

function flat(elements: readonly Uint8Array[]) {
  let buf: number[] = [];
  for (const elem of elements) {
    buf = [...buf, ...elem];
  }
  return new Uint8Array(buf);
}

function vec(elements: readonly Uint8Array[]) {
  let buf = [...uint32(elements.length)];
  for (const elem of elements) {
    buf = [...buf, ...elem];
  }
  return new Uint8Array(buf);
}

function section(id: number, elements: Uint8Array) {
  return new Uint8Array([id, ...encodeUnsigned(elements.byteLength), ...elements]);
}

function vecSection(id: number, elements: readonly Uint8Array[]) {
  if (!elements.length) return new Uint8Array();
  const content = vec(elements);
  return new Uint8Array([id, ...encodeUnsigned(content.byteLength), ...content]);
}

function nameMap(nmap: readonly NameAssociation[]): readonly Uint8Array[] {
  return nmap.map(({ idx, name: n }) => new Uint8Array([...uint32(idx), ...name(n)]));
}

function indirectMap(nmap: readonly IndirectNameMap[]): readonly Uint8Array[] {
  return nmap.map(({ idx, nameMap: subMap }) => new Uint8Array([...uint32(idx), ...vec(nameMap(subMap))]));
}

function numType(_valueType: ValType): Uint8Array {
  return new Uint8Array([0x7f]); // for i32
}

function funcType(ft: FuncType): Uint8Array {
  return new Uint8Array([0x60, ...vec(ft.paramType.map(numType)), ...vec(ft.resultType.map(numType))]);
}

function globalType(globalType: GlobalType): Uint8Array {
  return new Uint8Array([...numType(globalType.valueType), globalType.mutKind === "Const" ? 0x00 : 0x01]);
}

function limits({ min, max }: Limits): Uint8Array {
  if (!max) {
    return new Uint8Array([0x00, ...uint32(min)]);
  } else {
    return new Uint8Array([0x01, ...uint32(min), ...uint32(max)]);
  }
}

function blockType(bt: BlockType): Uint8Array {
  if (!bt) {
    return new Uint8Array([0x40]);
  } else if (typeof bt === "number") {
    return int32(bt);
  } else {
    return numType(bt);
  }
}

function instructions(instrs: readonly Instruction[]): readonly Uint8Array[] {
  return instrs.map(instr => {
    if (instr.kind === "ControlInstruction") {
      const { code } = controlInstructions[instr.instructionKind];
      return new Uint8Array([code, ...flat(instr.parameters.map(idx => uint32(idx)))]);
    } else if (instr.kind === "VariableInstruction") {
      const { code } = variableInstructions[instr.instructionKind];
      return new Uint8Array([code, ...flat(instr.parameters.map(idx => uint32(idx)))]);
    } else if (instr.kind === "NumericInstruction") {
      const { code, args } = numericInstructions[instr.instructionKind];
      return new Uint8Array([
        code,
        ...flat(
          instr.parameters.map((p, argIdx) => {
            if (args[argIdx] === "SignedInteger") {
              return int32(p);
            }
            return undefined as never;
          }),
        ),
      ]);
    } else if (instr.kind === "MemoryInstruction") {
      const { code } = memoryInstructions[instr.instructionKind];
      return new Uint8Array([code, ...uint32(instr.align), ...uint32(instr.offset)]);
    } else if (instr.kind === "IfInstruction") {
      const thenExpr = instructions(instr.thenExpr);
      const elseExpr = instructions(instr.elseExpr);
      return new Uint8Array([
        structuredInstructions.if.code,
        ...blockType(instr.blockType),
        ...flat(thenExpr),
        structuredInstructions.else.code,
        ...flat(elseExpr),
        structuredInstructions.end.code,
      ]);
    }
    // @ts-expect-error
    throw new Error(`${instr.kind}`);
  });
}

function expr(expression: Expr): Uint8Array {
  return new Uint8Array([...flat(instructions(expression)), 0x0b]);
}

function funcIdx(elemList: FunctionIndexList): Uint8Array {
  return new Uint8Array([0x00, ...expr(elemList.offsetExpr), ...vec(elemList.indices.map(i => uint32(i)))]);
}

function nameData(names: Names): Uint8Array {
  return new Uint8Array([
    ...name("name"),
    ...vecSection(1, nameMap(names.funcs)),
    ...vecSection(2, indirectMap(names.locals)),
    ...vecSection(4, nameMap(names.types)),
    ...vecSection(5, nameMap(names.tables)),
    ...vecSection(6, nameMap(names.mems)),
    ...vecSection(7, nameMap(names.globals)),
  ]);
}

function customSec(mod: Module, { enabledNameSection }: BinaryOutputOptions): Uint8Array {
  if (!enabledNameSection) {
    return new Uint8Array([]);
  }
  return section(0, nameData(mod.names));
}

function typeSec(funcTypes: readonly FuncType[]): Uint8Array {
  return vecSection(1, funcTypes.map(funcType));
}

function funcSec(funcs: readonly Func[]): Uint8Array {
  return vecSection(
    3,
    funcs.map(func => uint32(func.type)),
  );
}

function tableSec(tableTypes: readonly TableType[]): Uint8Array {
  return vecSection(
    4,
    tableTypes.map(tableType => {
      const marker = tableType.refType === "Funcref" ? 0x70 : 0x6f;
      return new Uint8Array([marker, ...limits(tableType.limits)]);
    }),
  );
}

function memSec(memTypes: readonly MemType[]): Uint8Array {
  return vecSection(
    5,
    memTypes.map(m => limits(m.limits)),
  );
}

function globalSec(globals: readonly Global[]): Uint8Array {
  return vecSection(
    6,
    globals.map(g => new Uint8Array([...globalType(g.type), ...expr(g.expr)])),
  );
}

function exportSec(exports: readonly Export[]): Uint8Array {
  return vecSection(
    7,
    exports.map(e => new Uint8Array([...name(e.name), exportTypes[e.exportKind], ...uint32(e.index)])),
  );
}

function elemSec(elems: readonly Elem[]): Uint8Array {
  return vecSection(
    9,
    elems.map(elem => funcIdx(elem.elemList)),
  );
}

function codeSec(funcs: readonly Func[]): Uint8Array {
  return vecSection(
    10,
    funcs.map(func => {
      const f = [...vec(func.locals.map(l => new Uint8Array([1, ...numType(l)]))), ...expr(func.body)];
      const size = uint32(f.length);
      return new Uint8Array([...size, ...f]);
    }),
  );
}

export function unparse(mod: Module, options: BinaryOutputOptions): Uint8Array {
  const head = new Uint8Array([...magic, ...version]);
  const ret = new Uint8Array([
    ...head,
    ...typeSec(mod.types),
    ...funcSec(mod.funcs),
    ...tableSec(mod.tables),
    ...memSec(mod.mems),
    ...globalSec(mod.globals),
    ...exportSec(mod.exports),
    ...elemSec(mod.elems),
    ...codeSec(mod.funcs),
    ...customSec(mod, options),
  ]);
  return ret;
}
