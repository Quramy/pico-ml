import { Module, Limits, MemType, FuncType, ValType } from "../structure-types";
import { encodeUnsigned } from "./leb";

const magic = [0x00, 0x61, 0x73, 0x6d];
const version = [0x01, 0x00, 0x00, 0x00];

function uint32(value: number) {
  return encodeUnsigned(value);
}

function vec(elements: readonly Uint8Array[]) {
  let buf: number[] = [elements.length];
  for (const elem of elements) {
    buf = [...buf, ...elem];
  }
  return new Uint8Array(buf);
}

function section(id: number, content: Uint8Array) {
  return new Uint8Array([id, ...encodeUnsigned(content.byteLength), ...content]);
}

function numType(_valueType: ValType): Uint8Array {
  return new Uint8Array([0x7f]); // for i32
}

function funcType(ft: FuncType): Uint8Array {
  return new Uint8Array([0x60, ...vec(ft.paramType.map(numType)), ...vec(ft.resultType.map(numType))]);
}

function types(funcTypes: readonly FuncType[]): Uint8Array {
  return section(1, vec(funcTypes.map(funcType)));
}

function limits({ min, max }: Limits): Uint8Array {
  if (!max) {
    return new Uint8Array([0x00, ...uint32(min)]);
  } else {
    return new Uint8Array([0x01, ...uint32(min), ...uint32(max)]);
  }
}

function mems(memTypes: readonly MemType[]): Uint8Array {
  return section(5, vec(memTypes.map(m => limits(m.limits))));
}

export function unparse(mod: Module): Uint8Array {
  const head = new Uint8Array([...magic, ...version]);
  const ret = new Uint8Array([...head, ...types(mod.types), ...mems(mod.mems)]);
  return ret;
}
