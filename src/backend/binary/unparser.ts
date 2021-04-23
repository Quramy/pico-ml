import { Module, Limits, MemType, FuncType, ValType, Func, Expr } from "../structure-types";
import { encodeUnsigned, encodeSigned } from "./leb";
import { variableInstructions, numericInstructions } from "../instructions-map";

const magic = [0x00, 0x61, 0x73, 0x6d];
const version = [0x01, 0x00, 0x00, 0x00];

function uint32(value: number) {
  return encodeUnsigned(value);
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

function funcsec(funcs: readonly Func[]): Uint8Array {
  return section(3, vec(funcs.map(func => uint32(func.type))));
}

function mems(memTypes: readonly MemType[]): Uint8Array {
  return section(5, vec(memTypes.map(m => limits(m.limits))));
}

function expr(expression: Expr): Uint8Array {
  const instructions = expression.map(instr => {
    if (instr.kind === "VariableInstruction") {
      const { code } = variableInstructions[instr.instructionKind];
      return new Uint8Array([code, ...flat(instr.parameters.map(idx => uint32(idx)))]);
    } else if (instr.kind === "NumericInstruction") {
      const { code, args } = numericInstructions[instr.instructionKind];
      return new Uint8Array([
        code,
        ...flat(
          instr.parameters.map((p, argIdx) => {
            if (args[argIdx] === "SignedInteger") {
              return encodeSigned(p);
            }
            return undefined as never;
          }),
        ),
      ]);
    }
    return undefined as never;
  });
  return new Uint8Array([...flat(instructions), 0x0b]);
}

function codesec(funcs: readonly Func[]): Uint8Array {
  return section(
    10,
    vec(
      funcs.map(func => {
        const f = [...vec(func.locals.map(numType)), ...expr(func.body)];
        const size = uint32(f.length);
        return new Uint8Array([...size, ...f]);
      }),
    ),
  );
}

export function unparse(mod: Module): Uint8Array {
  const head = new Uint8Array([...magic, ...version]);
  const ret = new Uint8Array([
    ...head,
    ...types(mod.types),
    ...funcsec(mod.funcs),
    ...mems(mod.mems),
    ...codesec(mod.funcs),
  ]);
  return ret;
}
