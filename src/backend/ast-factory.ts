import { Position } from "../parser-util";
import {
  ModuleBodyNode,
  ModuleNode,
  Uint32LiteralNode,
  Int32LiteralNode,
  LimitsNode,
  MemoryNode,
  IdentifierNode,
  ValueTypeNode,
  ValueTypeKind,
  ParamTypeNode,
  FuncTypeNode,
  TypeNode,
  FuncSigNode,
  IndexNode,
  NumericInstructionNode,
  VariableInstructionNode,
  LocalVarNode,
  InstructionNode,
  FuncNode,
  ExportedFuncNode,
  ExportedMemoryNode,
  ExportedSecNode,
  ExportNode,
  BlockTypeNode,
  ControlInstructionNode,
  IfInstructionNode,
  MemoryInstructionNode,
  FuncTypeRefNode,
  ExportedTableNode,
  RefKind,
  RefTypeNode,
  TableTypeNode,
  TableNode,
  ElementListNode,
  FunctionIndexListNode,
  ElemNode,
  ExprNode,
} from "./ast-types";
import {
  NumericInstructionKind,
  VariableInstructionKind,
  ControlInstructionKind,
  MemoryInstructionKind,
} from "./instructions-map";

export function uint32(value: number, pos?: Position): Uint32LiteralNode {
  return {
    kind: "Uint32Literal",
    value,
    loc: pos?.loc,
  };
}

export function int32(value: number, pos?: Position): Int32LiteralNode {
  return {
    kind: "Int32Literal",
    value,
    loc: pos?.loc,
  };
}

export function limits(min: Uint32LiteralNode, max?: Uint32LiteralNode | null, pos?: Position): LimitsNode {
  return {
    kind: "Limits",
    min,
    max: max ?? null,
    loc: pos?.loc,
  };
}

export function memory(limits: LimitsNode, id?: IdentifierNode | null, pos?: Position): MemoryNode {
  return {
    kind: "Memory",
    limits,
    id: id ?? null,
    loc: pos?.loc,
  };
}

export function mod(body: readonly ModuleBodyNode[], id?: IdentifierNode | null, pos?: Position): ModuleNode {
  return {
    kind: "Module",
    body,
    id: id ?? null,
    loc: pos?.loc,
  };
}

export function identifier(value: string, pos?: Position): IdentifierNode {
  return {
    kind: "Identifier",
    value,
    loc: pos?.loc,
  };
}

export function valueType(valueKind: ValueTypeKind, pos?: Position): ValueTypeNode {
  return {
    kind: "ValueType",
    valueKind,
    loc: pos?.loc,
  };
}

export function paramType(valueType: ValueTypeNode, id?: IdentifierNode | null, pos?: Position): ParamTypeNode {
  return {
    kind: "ParamType",
    id: id ?? null,
    valueType,
    loc: pos?.loc,
  };
}

export function refType(refKind: RefKind, pos?: Position): RefTypeNode {
  return {
    kind: "RefType",
    refKind,
    loc: pos?.loc,
  };
}

export function localVar(valueType: ValueTypeNode, id?: IdentifierNode | null, pos?: Position): LocalVarNode {
  return {
    kind: "LocalVar",
    id: id ?? null,
    valueType,
    loc: pos?.loc,
  };
}

export function funcType(
  params: readonly ParamTypeNode[],
  results: readonly ValueTypeNode[],
  pos?: Position,
): FuncTypeNode {
  return {
    kind: "FuncType",
    params,
    results,
    loc: pos?.loc,
  };
}

export function typedef(funcType: FuncTypeNode, id?: IdentifierNode | null, pos?: Position): TypeNode {
  return {
    kind: "Type",
    funcType,
    id: id ?? null,
    loc: pos?.loc,
  };
}

export function funcTypeRef(type: IndexNode, pos?: Position): FuncTypeRefNode {
  return {
    kind: "FuncTypeRef",
    type,
    loc: pos?.loc,
  };
}

export function funcSig(
  params: readonly ParamTypeNode[],
  results: readonly ValueTypeNode[],
  index?: IndexNode | null,
  pos?: Position,
): FuncSigNode {
  return {
    kind: "FuncSig",
    type: index ?? null,
    params,
    results,
    loc: pos?.loc,
  };
}

export function blockType(results: readonly ValueTypeNode[], index?: IndexNode | null, pos?: Position): BlockTypeNode {
  return {
    kind: "BlockType",
    type: index ?? null,
    results,
    loc: pos?.loc,
  };
}

export function ifInstr(
  blockType: BlockTypeNode,
  thenExpr: readonly InstructionNode[],
  elseExpr: readonly InstructionNode[],
  id?: IdentifierNode | null,
  pos?: Position,
): IfInstructionNode {
  return {
    kind: "IfInstruction",
    blockType,
    thenExpr,
    elseExpr,
    id: id ?? null,
    elseId: id ?? null,
    endId: id ?? null,
    loc: pos?.loc,
  };
}

export function controlInstr(
  instructionKind: ControlInstructionKind,
  params?: readonly (IndexNode | FuncTypeRefNode)[],
  pos?: Position,
): ControlInstructionNode {
  return {
    kind: "ControlInstruction",
    instructionKind,
    parameters: params ?? [],
    loc: pos?.loc,
  };
}

export function variableInstr(
  instructionKind: VariableInstructionKind,
  params?: readonly IndexNode[],
  pos?: Position,
): VariableInstructionNode {
  return {
    kind: "VariableInstruction",
    instructionKind,
    parameters: params ?? [],
    loc: pos?.loc,
  };
}

export function numericInstr(
  instructionKind: NumericInstructionKind,
  params?: readonly Int32LiteralNode[],
  pos?: Position,
): NumericInstructionNode {
  return {
    kind: "NumericInstruction",
    instructionKind,
    parameters: params ?? [],
    loc: pos?.loc,
  };
}

export function memoryInstr(
  instructionKind: MemoryInstructionKind,
  offset?: Uint32LiteralNode | null,
  align?: Uint32LiteralNode | null,
  pos?: Position,
): MemoryInstructionNode {
  return {
    kind: "MemoryInstruction",
    instructionKind,
    offset: offset ?? null,
    align: align ?? null,
    loc: pos?.loc,
  };
}

export function func(
  signature: FuncSigNode,
  locals: readonly LocalVarNode[],
  instructions: readonly InstructionNode[],
  id?: IdentifierNode | null,
  pos?: Position,
): FuncNode {
  return {
    kind: "Func",
    id: id ?? null,
    signature,
    locals,
    instructions,
    loc: pos?.loc,
  };
}

export function tableType(refType: RefTypeNode, limits: LimitsNode, pos?: Position): TableTypeNode {
  return {
    kind: "TableType",
    refType,
    limits,
    loc: pos?.loc,
  };
}

export function tableWithType(tableType: TableTypeNode, id?: IdentifierNode | null, pos?: Position): TableNode {
  return {
    kind: "Table",
    id: id ?? null,
    tableType,
    elemList: null,
    loc: pos?.loc,
  };
}

export function functionIndexList(indices: readonly IndexNode[], pos?: Position): FunctionIndexListNode {
  return {
    kind: "FunctionIndexList",
    indices,
    loc: pos?.loc,
  };
}

export function elem(
  elemList: ElementListNode,
  offsetExpr: ExprNode,
  id?: IdentifierNode | null,
  pos?: Position,
): ElemNode {
  return {
    kind: "Elem",
    elemList,
    offsetExpr,
    id: id ?? null,
    loc: pos?.loc,
  };
}

export function tableWithElemList(elemList: ElementListNode, id?: IdentifierNode | null, pos?: Position): TableNode {
  return {
    kind: "Table",
    elemList,
    id: id ?? null,
    tableType: null,
    loc: pos?.loc,
  };
}

export function exportedFunc(index: IndexNode, pos?: Position): ExportedFuncNode {
  return {
    kind: "ExportedFunc",
    index,
    loc: pos?.loc,
  };
}

export function exportedMemory(index: IndexNode, pos?: Position): ExportedMemoryNode {
  return {
    kind: "ExportedMemory",
    index,
    loc: pos?.loc,
  };
}

export function exportedTable(index: IndexNode, pos?: Position): ExportedTableNode {
  return {
    kind: "ExportedTable",
    index,
    loc: pos?.loc,
  };
}

export function exportNode(name: string, sec: ExportedSecNode, pos?: Position): ExportNode {
  return {
    kind: "Export",
    name,
    sec,
    loc: pos?.loc,
  };
}
