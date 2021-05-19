import { Result, ok, error, all, mapValue, TraverserCallbackFn, createTreeTraverser } from "../../../structure";
import { FuncNode, InstructionNode } from "../../ast-types";
import { Func, FuncType, Instruction, ValType, UInt32Index, ResultType } from "../../structure-types";
import { RefereneceContext, findIndex, createIndex } from "../ref";
import {
  variableInstructions,
  numericInstructions,
  controlInstructions,
  memoryInstructions,
} from "../../instructions-map";
import { convertMaybeUint32 } from "./uint32";

export interface State {
  readonly funcs: readonly Func[];
  readonly types: readonly FuncType[];
}

function funcType(params: ResultType, results: ResultType): FuncType {
  return {
    kind: "FuncType",
    paramType: params,
    resultType: results,
  };
}

function compareFuncType(typeA: FuncType, typeB: FuncType): boolean {
  if (typeA.kind !== typeB.kind) return false;
  if (typeA.paramType.length !== typeB.paramType.length) return false;
  if (typeA.resultType.length !== typeB.resultType.length) return false;
  for (let i = 0; i < typeA.paramType.length; i++) {
    if (typeA.paramType[i].kind !== typeB.paramType[i].kind) return false;
  }
  for (let i = 0; i < typeA.resultType.length; i++) {
    if (typeA.resultType[i].kind !== typeB.resultType[i].kind) return false;
  }
  return true;
}

interface ConvertInstrContext {
  readonly types: FuncType[];
  readonly refCtx: RefereneceContext;
}

type ConvertInstrFn<K extends InstructionNode["kind"]> = TraverserCallbackFn<
  InstructionNode,
  ConvertInstrContext,
  Result<Instruction>,
  K
>;

const controlInstruction: ConvertInstrFn<"ControlInstruction"> = (node, { refCtx }) => {
  const { args } = controlInstructions[node.instructionKind];
  return all(
    node.parameters.map((p, i) => {
      if (!args[i]) return error({ message: `${node.instructionKind} can not have ${i}th param` }) as Result<number>;
      return findIndex(refCtx[args[i]]!, p.kind === "FuncTypeRef" ? p.type : p);
    }),
  ).map(
    parameters =>
      ({
        kind: "ControlInstruction",
        instructionKind: node.instructionKind,
        parameters,
      } as Instruction),
  );
};

const variableInstruction: ConvertInstrFn<"VariableInstruction"> = (node, { refCtx }) => {
  const { args } = variableInstructions[node.instructionKind];
  return all(
    node.parameters.map((p, i) => {
      if (!args[i]) return error({ message: `${node.instructionKind} can not have ${i}th param` }) as Result<number>;
      return findIndex(refCtx[args[i]]!, p);
    }),
  ).map(
    parameters =>
      ({
        kind: "VariableInstruction",
        instructionKind: node.instructionKind,
        parameters,
      } as Instruction),
  );
};

const numericInstruction: ConvertInstrFn<"NumericInstruction"> = node => {
  const { args } = numericInstructions[node.instructionKind];
  return all(
    node.parameters.map((p, i) => {
      if (!args[i]) return error({ message: `${node.instructionKind} can not have ${i}th param` }) as Result<number>;
      return ok(p.value);
    }),
  ).map(
    parameters =>
      ({
        kind: "NumericInstruction",
        instructionKind: node.instructionKind,
        parameters,
      } as Instruction),
  );
};

const memoryInstruction: ConvertInstrFn<"MemoryInstruction"> = node => {
  const { defaultAlign } = memoryInstructions[node.instructionKind];
  return mapValue(
    convertMaybeUint32(node.offset),
    convertMaybeUint32(node.align),
  )((offset, align) =>
    ok({
      kind: "MemoryInstruction",
      instructionKind: node.instructionKind,
      offset: offset ?? 0,
      align: align ?? defaultAlign,
    }),
  );
};

const ifInstruction: ConvertInstrFn<"IfInstruction"> = (node, ctx, next) => {
  let blockType: ValType | UInt32Index | null = null;
  if (!node.blockType.type && node.blockType.results.length === 0) {
    blockType = null;
  } else if (!node.blockType.type && node.blockType.results.length === 1) {
    blockType = { kind: "Int32Type" };
  } else if (node.blockType.type) {
    const foundResult = findIndex(ctx.refCtx.types, node.blockType.type);
    if (!foundResult.ok) return error(foundResult.value);
    blockType = foundResult.value;
  } else {
    const ft = funcType(
      [],
      node.blockType.results.map(() => ({ kind: "Int32Type" })),
    );
    const foundIndex = ctx.types.findIndex(t => compareFuncType(t, ft));
    if (foundIndex === -1) {
      blockType = ctx.types.length;
      ctx.types.push(ft);
    } else {
      blockType = foundIndex;
    }
  }
  return mapValue(
    all(node.thenExpr.map(instr => next(instr, ctx))),
    all(node.elseExpr.map(instr => next(instr, ctx))),
  )((thenExpr, elseExpr) =>
    ok({
      kind: "IfInstruction",
      blockType,
      thenExpr,
      elseExpr,
    }),
  );
};

export const convertInstr = createTreeTraverser<InstructionNode, ConvertInstrContext, Result<Instruction>>({
  ifInstruction,
  controlInstruction,
  variableInstruction,
  numericInstruction,
  memoryInstruction,
});

export function convertFunc(node: FuncNode, idx: number, prev: State, refCtx: RefereneceContext): Result<State> {
  const locals = new Map<string, number>();
  let typeidx: number | undefined = undefined;
  let next = prev;
  const { signature } = node;
  if (signature.type === null) {
    // create new func type
    const ft = funcType(
      signature.params.map(() => ({ kind: "Int32Type" })),
      signature.results.map(() => ({ kind: "Int32Type" })),
    );
    const foundIdx = prev.types.findIndex(t => compareFuncType(t, ft));
    if (foundIdx === -1) {
      typeidx = prev.types.length;
      next = { ...prev, types: [...prev.types, ft] };
    } else {
      typeidx = foundIdx;
    }
    createIndex([...signature.params, ...node.locals], locals);
  } else {
    const found = findIndex(refCtx.types, signature.type);
    if (!found.ok) return error(found.value);
    typeidx = found.value;
    createIndex(node.locals, locals);
  }

  refCtx.funcLocals.set(idx, locals);

  const mutTypes = next.types.slice();

  return all(node.instructions.map(instr => convertInstr(instr, { refCtx: { ...refCtx, locals }, types: mutTypes })))
    .map(
      body =>
        ({
          kind: "Func",
          type: typeidx,
          locals: node.locals.map(() => ({ kind: "Int32Type" })),
          body,
        } as Func),
    )
    .map(
      func =>
        ({
          types: mutTypes,
          funcs: [...prev.funcs, func],
        } as State),
    );
}
