import {
  Parser,
  Scanner,
  NullPosition,
  use,
  oneOf,
  tryWith,
  expect,
  option,
  vec,
  fromOptional,
  loc,
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
  ExportedSecNode,
  ExportNode,
  IfInstructionNode,
  BlockTypeNode,
  ControlInstructionNode,
  MemoryInstructionNode,
  FuncTypeRefNode,
  TableNode,
  FunctionIndexListNode,
  ElemNode,
  MutValueTypeNode,
  GlobalNode,
} from "../ast-types";
import {
  symbolToken,
  keywordToken,
  keywordsToken,
  identifierToken,
  uintToken,
  intToken,
  strToken,
  memArgToken,
} from "./tokenizer";
import {
  getControlInstructionKinds,
  getVariableInstructionKinds,
  getNumericInstructionKinds,
  getMemoryInstructionKinds,
} from "../instructions-map";

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

const mutValue: Parser<MutValueTypeNode> = tryWith(
  expect(
    symbolToken("("),
    keywordToken("mut"),
    valType,
    symbolToken(")"),
  )(
    (tLp, tMut, valueType, tRp): MutValueTypeNode => ({
      kind: "MutValueType",
      valueType,
      ...loc(tLp, tMut, valueType, tRp),
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

const blockType: Parser<BlockTypeNode> = tryWith(
  expect(
    option(typeUseRef),
    vec(result),
  )(
    (mayBeIndex, results): BlockTypeNode => ({
      kind: "BlockType",
      type: fromOptional(mayBeIndex)(idx => idx),
      results: results.values,
      ...loc(mayBeIndex, results),
    }),
  ),
);

const ifInstr: Parser<IfInstructionNode> = tryWith(
  expect(
    keywordToken("if"),
    option(identifierToken),
    blockType,
    vec(use(() => instr)),
    keywordToken("else"),
    option(identifierToken),
    vec(use(() => instr)),
    keywordToken("end"),
    option(identifierToken),
  )(
    (tIf, tMaybeLabelId, blockType, thenExpr, tElse, tMaybeElseId, elseExpr, tEnd, tMaybeEndId): IfInstructionNode => ({
      kind: "IfInstruction",
      id: toIdNode(tMaybeLabelId),
      elseId: toIdNode(tMaybeElseId),
      endId: toIdNode(tMaybeEndId),
      blockType,
      thenExpr: thenExpr.values,
      elseExpr: elseExpr.values,
      ...loc(tIf, tMaybeLabelId, blockType, thenExpr, tElse, tMaybeElseId, elseExpr, tEnd, tMaybeEndId),
    }),
  ),
);

const funcTypeRef: Parser<FuncTypeRefNode> = tryWith(
  expect(typeUseRef)(
    (type): FuncTypeRefNode => ({
      kind: "FuncTypeRef",
      type,
      loc: type.loc,
    }),
  ),
);

const controlInstr: Parser<ControlInstructionNode> = tryWith(
  expect(
    keywordsToken(getControlInstructionKinds()),
    vec(oneOf(index, funcTypeRef)),
  )(
    (tInstrKind, params): ControlInstructionNode => ({
      kind: "ControlInstruction",
      instructionKind: tInstrKind.keyword,
      parameters: params.values,
      ...loc(tInstrKind, params),
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

const memoryInstr: Parser<MemoryInstructionNode> = tryWith(
  expect(
    keywordsToken(getMemoryInstructionKinds()),
    option(expect(memArgToken("offset="), u32)((t, v) => ({ ...v, ...loc(t, v) }))),
    option(expect(memArgToken("align="), u32)((t, v) => ({ ...v, ...loc(t, v) }))),
  )(
    (tInstrKind, maybeOffset, maybeAlign): MemoryInstructionNode => ({
      kind: "MemoryInstruction",
      instructionKind: tInstrKind.keyword,
      offset: fromOptional(maybeOffset)(n => n),
      align: fromOptional(maybeAlign)(n => n),
      ...loc(tInstrKind, maybeOffset, maybeAlign),
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

const instr: Parser<InstructionNode> = oneOf(ifInstr, controlInstr, numericInstr, variableInstr, memoryInstr);

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

const globalNode: Parser<GlobalNode> = tryWith(
  expect(
    symbolToken("("),
    keywordToken("global"),
    option(identifierToken),
    oneOf(valType, mutValue),
    vec(instr),
    symbolToken(")"),
  )(
    (tLp, tGlobal, maybeId, type, instructions, tRp): GlobalNode => ({
      kind: "Global",
      id: toIdNode(maybeId),
      type,
      expr: instructions.values,
      ...loc(tLp, tGlobal, maybeId, type, instructions, tRp),
    }),
  ),
);

const funcIndicesForTable: Parser<FunctionIndexListNode> = tryWith(
  expect(
    symbolToken("("),
    keywordToken("elem"),
    vec(index),
    symbolToken(")"),
  )(
    (tLp, tElem, indices, tRp): FunctionIndexListNode => ({
      kind: "FunctionIndexList",
      indices: indices.values,
      ...loc(tLp, tElem, indices, tRp),
    }),
  ),
);

const funcIndicesForElem: Parser<FunctionIndexListNode> = tryWith(
  expect(
    keywordToken("func"),
    vec(index),
  )(
    (tFunc, indices): FunctionIndexListNode => ({
      kind: "FunctionIndexList",
      indices: indices.values,
      ...loc(tFunc, indices),
    }),
  ),
);

const tableWithType: Parser<TableNode> = tryWith(
  expect(
    symbolToken("("),
    keywordToken("table"),
    option(identifierToken),
    limits,
    keywordToken("funcref"),
    symbolToken(")"),
  )(
    (tLp, tTable, maybeId, limits, tFuncref, tRp): TableNode => ({
      kind: "Table",
      elemList: null,
      id: toIdNode(maybeId),
      tableType: {
        kind: "TableType",
        limits,
        refType: {
          kind: "RefType",
          refKind: "Funcref",
          ...loc(tFuncref),
        },
        ...loc(limits),
      },
      ...loc(tLp, tTable, maybeId, limits, tFuncref, tRp),
    }),
  ),
);

const tableWithFunctionIndex: Parser<TableNode> = tryWith(
  expect(
    symbolToken("("),
    keywordToken("table"),
    option(identifierToken),
    keywordToken("funcref"),
    funcIndicesForTable,
    symbolToken(")"),
  )(
    (tLp, tTable, maybeId, tFuncref, elementList, tRp): TableNode => ({
      kind: "Table",
      id: toIdNode(maybeId),
      elemList: elementList,
      tableType: null,
      ...loc(tLp, tTable, maybeId, tFuncref, elementList, tRp),
    }),
  ),
);

const table = oneOf(tableWithType, tableWithFunctionIndex);

const elem: Parser<ElemNode> = tryWith(
  expect(
    symbolToken("("),
    keywordToken("elem"),
    option(identifierToken),
    symbolToken("("),
    keywordToken("offset"),
    vec(instr),
    symbolToken(")"),
    funcIndicesForElem,
    symbolToken(")"),
  )(
    (tLp, tElem, maybeId, tLpInner, tOffset, instructions, tRpInner, indices, tRp): ElemNode => ({
      kind: "Elem",
      id: toIdNode(maybeId),
      elemList: indices,
      offsetExpr: instructions.values,
      ...loc(tLp, tElem, maybeId, tLpInner, tOffset, instructions, tRpInner, indices, tRp),
    }),
  ),
);

const exportSec: Parser<ExportedSecNode> = tryWith(
  expect(
    symbolToken("("),
    oneOf(keywordToken("func"), keywordToken("memory"), keywordToken("table"), keywordToken("global")),
    index,
    symbolToken(")"),
  )(
    (tLp, tKeyword, index, tRp): ExportedSecNode => ({
      kind:
        tKeyword.keyword === "func"
          ? "ExportedFunc"
          : tKeyword.keyword === "memory"
          ? "ExportedMemory"
          : tKeyword.keyword === "table"
          ? "ExportedTable"
          : "ExportedGlobal",
      index,
      ...loc(tLp, tKeyword, index, tRp),
    }),
  ),
);

const exportNode: Parser<ExportNode> = tryWith(
  expect(
    symbolToken("("),
    keywordToken("export"),
    strToken,
    exportSec,
    symbolToken(")"),
  )(
    (tLp, tExport, tName, exportSec, tRp): ExportNode => ({
      kind: "Export",
      name: tName.value,
      sec: exportSec,
      ...loc(tLp, tExport, tName, exportSec, tRp),
    }),
  ),
);

const moduleField = oneOf(typedef, func, table, mem, globalNode, exportNode, elem);

const mod: Parser<ModuleNode> = expect(
  symbolToken("("),
  keywordToken("module"),
  option(identifierToken),
  vec(moduleField),
  symbolToken(")"),
)(
  (tLp, tModule, maybeId, fields, tRp): ModuleNode => ({
    kind: "Module",
    id: toIdNode(maybeId),
    body: fields.values,
    ...loc(tLp, tModule, maybeId, fields, tRp),
  }),
);

export const parseFuncSig = funcSig;
export const parseIfInstr = ifInstr;
export const parseControlInstr = controlInstr;
export const parseVariableInstr = variableInstr;
export const parseNumericInstr = numericInstr;
export const parseMemoryInstr = memoryInstr;

export const parseType = typedef;
export const parseFunc = func;
export const parseTable = table;
export const parseMemory = mem;
export const parseGlobal = globalNode;
export const parseExport = exportNode;
export const parseElem = elem;

export const parseModule = mod;

export const parse = (code: string) => parseModule(new Scanner(code));
