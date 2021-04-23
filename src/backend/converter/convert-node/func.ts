import { Result, ok, error, all } from "../../../structure";
import { FuncNode, InstructionNode, VariableInstructionNode, NumericInstructionNode } from "../../ast-types";
import { Func, FuncType, Instruction } from "../../structure-types";
import { funcType } from "../../structure-factory";
import { RefereneceContext, findIndex, createIndex } from "../ref";
import {
  variableInstructions,
  getVariableInstructionKinds,
  numericInstructions,
  getNumericInstructionKinds,
} from "../../instructions-map";

export interface State {
  readonly funcs: readonly Func[];
  readonly types: readonly FuncType[];
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

function isVariableInstr(node: InstructionNode): node is VariableInstructionNode {
  return getVariableInstructionKinds().some(k => node.instructionKind === k);
}

function isNumericInstr(node: InstructionNode): node is NumericInstructionNode {
  return getNumericInstructionKinds().some(k => node.instructionKind === k);
}

export function convertInstr(node: InstructionNode, refCtx: RefereneceContext): Result<Instruction> {
  if (isVariableInstr(node)) {
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
  } else if (isNumericInstr(node)) {
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
  }
  // @ts-expect-error
  return error({ message: `${node.instructionKind}` });
}

export function convertFunc(node: FuncNode, prev: State, refCtx: RefereneceContext): Result<State> {
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

  return all(node.instructions.map(instr => convertInstr(instr, { ...refCtx, locals })))
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
          ...next,
          funcs: [...prev.funcs, func],
        } as State),
    );
}
