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
} from "../structure-types";
import { encodeUnsigned, encodeSigned } from "./leb";
import {
  variableInstructions,
  numericInstructions,
  controlInstructions,
  structuredInstructions,
} from "../instructions-map";
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

function section(id: number, content: Uint8Array) {
  return new Uint8Array([id, ...encodeUnsigned(content.byteLength), ...content]);
}

function numType(_valueType: ValType): Uint8Array {
  return new Uint8Array([0x7f]); // for i32
}

function funcType(ft: FuncType): Uint8Array {
  return new Uint8Array([0x60, ...vec(ft.paramType.map(numType)), ...vec(ft.resultType.map(numType))]);
}

function typeSec(funcTypes: readonly FuncType[]): Uint8Array {
  return section(1, vec(funcTypes.map(funcType)));
}

function limits({ min, max }: Limits): Uint8Array {
  if (!max) {
    return new Uint8Array([0x00, ...uint32(min)]);
  } else {
    return new Uint8Array([0x01, ...uint32(min), ...uint32(max)]);
  }
}

function funcSec(funcs: readonly Func[]): Uint8Array {
  return section(3, vec(funcs.map(func => uint32(func.type))));
}

function memSec(memTypes: readonly MemType[]): Uint8Array {
  return section(5, vec(memTypes.map(m => limits(m.limits))));
}

function exportSec(exports: readonly Export[]): Uint8Array {
  return section(
    7,
    vec(exports.map(e => new Uint8Array([...name(e.name), exportTypes[e.exportKind], ...uint32(e.index)]))),
  );
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

function codeSec(funcs: readonly Func[]): Uint8Array {
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
    ...typeSec(mod.types),
    ...funcSec(mod.funcs),
    ...memSec(mod.mems),
    ...exportSec(mod.exports),
    ...codeSec(mod.funcs),
  ]);
  return ret;
}
