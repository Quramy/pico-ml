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
  controlInstructions,
  structuredInstructions,
  memoryInstructions,
  numberInstructions,
} from "../instructions-map";

import { encodeUnsigned, encodeSigned } from "./leb";

const magic = new Uint8Array([0x00, 0x61, 0x73, 0x6d]);
const version = new Uint8Array([0x01, 0x00, 0x00, 0x00]);

const exportTypeCode = {
  Func: 0x00,
  Table: 0x01,
  Memory: 0x02,
  Global: 0x03,
};

function byteMark(id: number) {
  return new Uint8Array([id]);
}

function uint32(value: number) {
  return encodeUnsigned(value);
}

function int32(value: number) {
  return encodeSigned(value);
}

function int64(value: number) {
  return encodeSigned(value);
}

function float32(value: number) {
  return new Uint8Array(new Float32Array(value).buffer);
}

function float64(value: number) {
  return new Uint8Array(new Float64Array(value).buffer);
}

function str(value: string) {
  return new TextEncoder().encode(value);
}

function concat(...elements: readonly Uint8Array[]) {
  const size = elements.reduce((s, a) => s + a.byteLength, 0);
  const ret = new Uint8Array(size);
  let offset = 0;
  for (const arr of elements) {
    ret.set(arr, offset);
    offset += arr.byteLength;
  }
  return ret;
}

function name(value: string) {
  const c = str(value);
  return concat(uint32(c.byteLength), c);
}

function vec(elements: readonly Uint8Array[]) {
  return concat(uint32(elements.length), ...elements);
}

function section(id: number, elements: Uint8Array) {
  return concat(byteMark(id), encodeSigned(elements.byteLength), elements);
}

function vecSection(id: number, elements: readonly Uint8Array[]) {
  if (!elements.length) return new Uint8Array();
  const content = vec(elements);
  return concat(byteMark(id), encodeUnsigned(content.byteLength), content);
}

function nameMap(nmap: readonly NameAssociation[]): readonly Uint8Array[] {
  return nmap.map(({ idx, name: n }) => concat(uint32(idx), name(n)));
}

function indirectMap(nmap: readonly IndirectNameMap[]): readonly Uint8Array[] {
  return nmap.map(({ idx, nameMap: subMap }) => concat(uint32(idx), vec(nameMap(subMap))));
}

function numType(_valueType: ValType): Uint8Array {
  return byteMark(0x7f); // for i32
}

function funcType(ft: FuncType): Uint8Array {
  return concat(byteMark(0x60), vec(ft.paramType.map(numType)), vec(ft.resultType.map(numType)));
}

function globalType(globalType: GlobalType): Uint8Array {
  return concat(numType(globalType.valueType), byteMark(globalType.mutKind === "Const" ? 0x00 : 0x01));
}

function limits({ min, max }: Limits): Uint8Array {
  if (!max) {
    return concat(byteMark(0x00), uint32(min));
  } else {
    return concat(byteMark(0x01), uint32(min), uint32(max));
  }
}

function blockType(bt: BlockType): Uint8Array {
  if (!bt) {
    return byteMark(0x40);
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
      return concat(byteMark(code), ...instr.parameters.map(idx => uint32(idx)));
    } else if (instr.kind === "VariableInstruction") {
      const { code } = variableInstructions[instr.instructionKind];
      return concat(byteMark(code), ...instr.parameters.map(idx => uint32(idx)));
    } else if (instr.kind === "NumericInstruction") {
      const { code, args } = numberInstructions[instr.instructionKind];
      return concat(
        byteMark(code),
        ...instr.parameters.map((p, argIdx) => {
          switch (args[argIdx]) {
            case "SignedInteger":
              return int32(p);
            case "DoubleSignedInteger":
              return int64(p);
            case "SignedFloat":
              return float32(p);
            case "DoubleSignedFloat":
              return float64(p);
            default:
              throw new Error(`invalit argument type: ${args[argIdx]}`);
          }
        }),
      );
    } else if (instr.kind === "MemoryInstruction") {
      const { code } = memoryInstructions[instr.instructionKind];
      return concat(byteMark(code), uint32(instr.align), uint32(instr.offset));
    } else if (instr.kind === "IfInstruction") {
      const thenExpr = instructions(instr.thenExpr);
      const elseExpr = instructions(instr.elseExpr);
      return concat(
        byteMark(structuredInstructions.if.code),
        blockType(instr.blockType),
        ...thenExpr,
        byteMark(structuredInstructions.else.code),
        ...elseExpr,
        byteMark(structuredInstructions.end.code),
      );
    }
    // @ts-expect-error
    throw new Error(`${instr.kind}`);
  });
}

function expr(expression: Expr): Uint8Array {
  return concat(...instructions(expression), byteMark(0x0b));
}

function funcIdx(elemList: FunctionIndexList): Uint8Array {
  return concat(byteMark(0x00), expr(elemList.offsetExpr), vec(elemList.indices.map(i => uint32(i))));
}

function nameData(names: Names): Uint8Array {
  return concat(
    name("name"),
    vecSection(1, nameMap(names.funcs)),
    vecSection(2, indirectMap(names.locals)),
    vecSection(4, nameMap(names.types)),
    vecSection(5, nameMap(names.tables)),
    vecSection(6, nameMap(names.mems)),
    vecSection(7, nameMap(names.globals)),
  );
}

function customSec(mod: Module, { enableNameSection }: BinaryOutputOptions): Uint8Array {
  if (!enableNameSection) {
    return new Uint8Array();
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
      const code = tableType.refType === "Funcref" ? 0x70 : 0x6f;
      return concat(byteMark(code), limits(tableType.limits));
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
    globals.map(g => concat(globalType(g.type), expr(g.expr))),
  );
}

function exportSec(exports: readonly Export[]): Uint8Array {
  return vecSection(
    7,
    exports.map(e => concat(name(e.name), byteMark(exportTypeCode[e.exportKind]), uint32(e.index))),
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
      const locals = vec(func.locals.map(l => concat(uint32(1), numType(l))));
      const body = expr(func.body);
      const size = uint32(locals.byteLength + body.byteLength);
      return concat(size, locals, body);
    }),
  );
}

export function unparse(mod: Module, options: BinaryOutputOptions): Uint8Array {
  const head = concat(magic, version);
  const ret = concat(
    head,
    typeSec(mod.types),
    funcSec(mod.funcs),
    tableSec(mod.tables),
    memSec(mod.mems),
    globalSec(mod.globals),
    exportSec(mod.exports),
    elemSec(mod.elems),
    codeSec(mod.funcs),
    customSec(mod, options),
  );
  return ret;
}
