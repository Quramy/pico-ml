import {
  Parser,
  loc,
  oneOf,
  expect,
  option,
  vec,
  tryWith,
  NullPosition,
  fromOptional,
  Scanner,
} from "../../parser-util";
import {
  ModuleNode,
  IdentifierToken,
  IdentifierNode,
  MemoryNode,
  LimitsNode,
  Uint32LiteralNode,
  Int32LiteralNode,
  TypeNode,
  FuncTypeNode,
  ParamTypeNode,
  ValueTypeNode,
  FuncSigNode,
  IndexNode,
  NumericInstructionNode,
  VariableInstructionNode,
  InstructionNode,
  LocalVarNode,
  FuncNode,
} from "../ast-types";
import { symbolToken, keywordToken, identifierToken, uintToken, intToken, keywordsToken } from "./tokenizer";
import { getNumericInstructionKinds, getVariableInstructionKinds } from "../instructions-map";

const identifier: Parser<IdentifierNode> = expect(identifierToken)(t => ({
  kind: "Identifier",
  value: t.name,
  loc: t.loc,
}));

const toIdNode = (maybeId: NullPosition | IdentifierToken): IdentifierNode | null =>
  fromOptional(maybeId)(token => ({
    kind: "Identifier",
    value: token.name,
    loc: token.loc,
  }));

const u32: Parser<Uint32LiteralNode> = expect(uintToken)(token => ({
  kind: "Uint32Literal",
  value: token.value,
  ...loc(token),
}));

const i32: Parser<Int32LiteralNode> = expect(intToken)(token => ({
  kind: "Int32Literal",
  value: token.value,
  ...loc(token),
}));

const index: Parser<IndexNode> = oneOf(identifier, u32);

const valType: Parser<ValueTypeNode> = expect(keywordToken("i32"))(
  (t): ValueTypeNode => ({
    kind: "ValueType",
    valueKind: "i32",
    ...loc(t),
  }),
);

const param: Parser<ParamTypeNode> = tryWith(
  expect(
    symbolToken("("),
    keywordToken("param"),
    option(identifierToken),
    valType,
    symbolToken(")"),
  )(
    (tLp, tParam, tMaybeId, valueType, tRp): ParamTypeNode => ({
      kind: "ParamType",
      id: toIdNode(tMaybeId),
      valueType,
      ...loc(tLp, tParam, tMaybeId, valueType, tRp),
    }),
  ),
);

const result: Parser<ValueTypeNode> = tryWith(
  expect(
    symbolToken("("),
    keywordToken("result"),
    keywordToken("i32"),
    symbolToken(")"),
  )(
    (tLp, tResult, tVk, tRp): ValueTypeNode => ({
      kind: "ValueType",
      valueKind: "i32",
      ...loc(tLp, tResult, tVk, tRp),
    }),
  ),
);

const funcType: Parser<FuncTypeNode> = tryWith(
  expect(
    symbolToken("("),
    keywordToken("func"),
    vec(param),
    vec(result),
    symbolToken(")"),
  )(
    (tLp, tFunc, params, results, tRp): FuncTypeNode => ({
      kind: "FuncType",
      params: params.values,
      results: results.values,
      ...loc(tLp, tFunc, params, results, tRp),
    }),
  ),
);

const typedef: Parser<TypeNode> = tryWith(
  expect(
    symbolToken("("),
    keywordToken("type"),
    option(identifierToken),
    funcType,
    symbolToken(")"),
  )(
    (tLp, tType, tMaybeId, funcType, tRp): TypeNode => ({
      kind: "Type",
      id: toIdNode(tMaybeId),
      funcType,
      ...loc(tLp, tType, tMaybeId, funcType, tRp),
    }),
  ),
);

const typeUseRef: Parser<IndexNode> = tryWith(
  expect(
    symbolToken("("),
    keywordToken("type"),
    index,
    symbolToken(")"),
  )((tLp, tType, idx, tRp): IndexNode => ({ ...idx, ...loc(tLp, tType, idx, tRp) })),
);

const funcSig: Parser<FuncSigNode> = tryWith(
  expect(
    option(typeUseRef),
    vec(param),
    vec(result),
  )(
    (mayBeIndex, params, results): FuncSigNode => ({
      kind: "FuncSig",
      type: fromOptional(mayBeIndex)(idx => idx),
      params: params.values,
      results: results.values,
      ...loc(mayBeIndex, params, results),
    }),
  ),
);

const variableInstr: Parser<VariableInstructionNode> = tryWith(
  expect(
    keywordsToken(getVariableInstructionKinds()),
    vec(index),
  )(
    (tInstrKind, params): VariableInstructionNode => ({
      kind: "VariableInstruction",
      instructionKind: tInstrKind.keyword,
      parameters: params.values,
      ...loc(tInstrKind, params),
    }),
  ),
);

const numericInstr: Parser<NumericInstructionNode> = tryWith(
  expect(
    keywordsToken(getNumericInstructionKinds()),
    vec(i32),
  )(
    (tInstrKind, params): NumericInstructionNode => ({
      kind: "NumericInstruction",
      instructionKind: tInstrKind.keyword,
      parameters: params.values,
      ...loc(tInstrKind, params),
    }),
  ),
);

const local: Parser<LocalVarNode> = tryWith(
  expect(
    symbolToken("("),
    keywordToken("local"),
    option(identifierToken),
    valType,
    symbolToken(")"),
  )(
    (tLp, tLocal, tMaybeId, valueType, tRp): LocalVarNode => ({
      kind: "LocalVar",
      id: toIdNode(tMaybeId),
      valueType,
      ...loc(tLp, tLocal, tMaybeId, valueType, tRp),
    }),
  ),
);

const instr: Parser<InstructionNode> = oneOf(numericInstr, variableInstr);

const func: Parser<FuncNode> = tryWith(
  expect(
    symbolToken("("),
    keywordToken("func"),
    option(identifierToken),
    funcSig,
    vec(local),
    vec(instr),
    symbolToken(")"),
  )(
    (tLp, tFunc, tMaybeId, signature, locals, instructions, tRp): FuncNode => ({
      kind: "Func",
      id: toIdNode(tMaybeId),
      signature,
      locals: locals.values,
      instructions: instructions.values,
      ...loc(tLp, tFunc, tMaybeId, signature, locals, instructions, tRp),
    }),
  ),
);

const limits: Parser<LimitsNode> = expect(
  u32,
  option(u32),
)((min, max) => ({
  kind: "Limits",
  min,
  max: fromOptional(max)(max => max),
  ...loc(min, max),
}));

const mem: Parser<MemoryNode> = tryWith(
  expect(
    symbolToken("("),
    keywordToken("memory"),
    option(identifierToken),
    limits,
    symbolToken(")"),
  )(
    (tLp, tMemory, tMaybeId, limits, tRp): MemoryNode => ({
      kind: "Memory",
      id: toIdNode(tMaybeId),
      limits,
      ...loc(tLp, tMemory, tMaybeId, limits, tRp),
    }),
  ),
);

const moduleField = oneOf(typedef, func, mem);

const mod: Parser<ModuleNode> = expect(
  symbolToken("("),
  keywordToken("module"),
  option(identifierToken),
  vec(moduleField),
  symbolToken(")"),
)(
  (tLp, tModule, maybeId, memValues, tRp): ModuleNode => ({
    kind: "Module",
    id: toIdNode(maybeId),
    body: memValues.values,
    ...loc(tLp, tModule, maybeId, memValues, tRp),
  }),
);

export const parseType = typedef;
export const parseFuncSig = funcSig;
export const parseVariableInstr = variableInstr;
export const parseNumericInstr = numericInstr;
export const parseFunc = func;
export const parseMemory = mem;
export const parseModule = mod;
export const parse = (code: string) => parseModule(new Scanner(code));
