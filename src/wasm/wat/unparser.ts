import {
  ReservedWordKind,
  ModuleNode,
  ModuleBodyNode,
  ParamTypeNode,
  TypeNode,
  IdentifierNode,
  FuncTypeNode,
  ValueTypeNode,
  FuncNode,
  FuncSigNode,
  IndexNode,
  Uint32LiteralNode,
  Int32LiteralNode,
  LocalVarNode,
  ExprNode,
  NumericInstructionNode,
  ControlInstructionNode,
  FuncTypeRefNode,
  MemoryInstructionNode,
  VariableInstructionNode,
  IfInstructionNode,
  BlockTypeNode,
  TableNode,
  TableTypeNode,
  LimitsNode,
  RefTypeNode,
  FunctionIndexListNode,
  MemoryNode,
  GlobalNode,
  GlobalTypeNode,
  ExportNode,
  ExportedSecNode,
  ElemNode,
} from "../ast-types";

class Writer {
  private buffer: string[] = [];
  private level = 0;

  append(str: string) {
    const l = this.buffer.pop();
    if (!l) {
      this.pushLine(str);
      return this;
    }
    if (l.endsWith("(") || !l.trim().length) {
      this.buffer.push(l + str);
    } else {
      this.buffer.push(l + " " + str);
    }
    return this;
  }

  lp() {
    const l = this.buffer.pop();
    if (!l) {
      this.pushLine("(");
      return this;
    }
    if (l.trim().length) {
      this.buffer.push(l + " (");
    } else {
      this.buffer.push(l + "(");
    }
    return this;
  }

  keywordToken(str: ReservedWordKind) {
    return this.append(str);
  }

  memArg(str: "offset=" | "align=", value: number) {
    return this.append(`${str}${value}`);
  }

  rp() {
    const l = this.buffer.pop();
    if (!l) {
      this.pushLine(")");
      return this;
    }
    this.buffer.push(l + ")");
    return this;
  }

  pushLine(line = "") {
    this.buffer.push("".padStart(this.level * 2, " ") + line.trim());
    return this;
  }

  dump() {
    return this.buffer.join("\n");
  }

  indent() {
    this.level += 1;
  }

  unindent() {
    this.level -= 1;
  }
}

function unparseInt(node: Uint32LiteralNode | Int32LiteralNode, writer: Writer) {
  writer.append(`${node.value}`);
}

function unparseId(id: IdentifierNode | null, writer: Writer) {
  if (!id) return;
  writer.append("$" + id.value);
}

function unparseValueType(node: ValueTypeNode, writer: Writer) {
  writer.append(node.valueKind);
}

function unparseParamType(node: ParamTypeNode, writer: Writer) {
  writer.lp().keywordToken("param");
  unparseId(node.id, writer);
  unparseValueType(node.valueType, writer);
  writer.rp();
}

function unparseResultType(node: ValueTypeNode, writer: Writer) {
  writer.lp().keywordToken("result");
  unparseValueType(node, writer);
  writer.rp();
}

function unparseFuncType(node: FuncTypeNode, writer: Writer) {
  writer.lp().keywordToken("func");
  node.params.forEach(p => unparseParamType(p, writer));
  node.results.forEach(r => unparseResultType(r, writer));
  writer.rp();
}

function unparseIndex(node: IndexNode, writer: Writer) {
  if (node.kind === "Identifier") {
    unparseId(node, writer);
  } else {
    unparseInt(node, writer);
  }
}

function unparseFuncSig(node: FuncSigNode, writer: Writer) {
  if (node.type) {
    writer.lp().keywordToken("type");
    unparseIndex(node.type, writer);
    writer.rp();
  }
  node.params.forEach(p => unparseParamType(p, writer));
  node.results.forEach(r => unparseResultType(r, writer));
}

function unparseLocalVar(node: LocalVarNode, writer: Writer) {
  writer.lp().keywordToken("local");
  unparseId(node.id, writer);
  unparseValueType(node.valueType, writer);
  writer.rp();
}

function unparseFuncTypeRef(node: FuncTypeRefNode, writer: Writer) {
  writer.lp().keywordToken("type");
  unparseIndex(node.type, writer);
  writer.rp();
}

function unparseBlockType(node: BlockTypeNode, writer: Writer) {
  if (node.type) {
    writer.lp().keywordToken("type");
    unparseIndex(node.type, writer);
    writer.rp();
  }
  node.results.forEach(r => unparseResultType(r, writer));
}

function unparseIfInstr(node: IfInstructionNode, writer: Writer) {
  writer.keywordToken("if");
  unparseBlockType(node.blockType, writer);
  unparseExpr(node.thenExpr, writer);
  writer.pushLine().keywordToken("else");
  unparseExpr(node.elseExpr, writer);
  writer.pushLine().keywordToken("end");
}

function unparseNumericInstr(node: NumericInstructionNode, writer: Writer) {
  writer.keywordToken(node.instructionKind);
  node.parameters.forEach(p => unparseInt(p, writer));
}

function unparseControlInstr(node: ControlInstructionNode, writer: Writer) {
  writer.keywordToken(node.instructionKind);
  node.parameters.forEach(p => {
    if (p.kind === "FuncTypeRef") {
      unparseFuncTypeRef(p, writer);
    } else {
      unparseIndex(p, writer);
    }
  });
}

function unparseMemoryInstr(node: MemoryInstructionNode, writer: Writer) {
  writer.keywordToken(node.instructionKind);
  if (node.offset) {
    writer.memArg("offset=", node.offset.value);
  }
  if (node.align) {
    writer.memArg("align=", node.align.value);
  }
}

function unparseVariableInstr(node: VariableInstructionNode, writer: Writer) {
  writer.keywordToken(node.instructionKind);
  node.parameters.forEach(p => unparseIndex(p, writer));
}

function unparseExpr(node: ExprNode, writer: Writer) {
  writer.indent();
  node.forEach(instr => {
    writer.pushLine();
    switch (instr.kind) {
      case "IfInstruction":
        return unparseIfInstr(instr, writer);
      case "NumericInstruction":
        return unparseNumericInstr(instr, writer);
      case "ControlInstruction":
        return unparseControlInstr(instr, writer);
      case "MemoryInstruction":
        return unparseMemoryInstr(instr, writer);
      case "VariableInstruction":
        return unparseVariableInstr(instr, writer);
    }
  });
  writer.unindent();
}

function unparseLimits(node: LimitsNode, writer: Writer) {
  unparseInt(node.min, writer);
  if (node.max) {
    unparseInt(node.max, writer);
  }
}

function unparseRefType(node: RefTypeNode, writer: Writer) {
  if (node.refKind === "Funcref") {
    writer.keywordToken("funcref");
  } else {
    writer.keywordToken("externref");
  }
}

function unparseTableType(node: TableTypeNode, writer: Writer) {
  unparseLimits(node.limits, writer);
  unparseRefType(node.refType, writer);
}

function unparseFunctionIndexListForTable(node: FunctionIndexListNode, writer: Writer) {
  writer.lp().keywordToken("elem");
  node.indices.forEach(index => unparseIndex(index, writer));
  writer.rp();
}

function unparseFunctionIndexListForElem(node: FunctionIndexListNode, writer: Writer) {
  writer.keywordToken("func");
  node.indices.forEach(index => unparseIndex(index, writer));
}

function unparseGlobalType(node: GlobalTypeNode, writer: Writer) {
  if (node.kind === "MutValueType") {
    writer.lp().keywordToken("mut");
    unparseValueType(node.valueType, writer);
    writer.rp();
  } else {
    unparseValueType(node, writer);
  }
}

function unparseName(name: string, writer: Writer) {
  const escaped = name
    .replace(/"/g, '\\"')
    .replace(/\t/g, "\\\t")
    .replace(/\n/g, "\\\n")
    .replace(/\r/g, "\\\r")
    .replace(/\\/g, "\\\\");
  writer.append(`"${escaped}"`);
}

function unparseExportSec(node: ExportedSecNode, writer: Writer) {
  switch (node.kind) {
    case "ExportedFunc":
      writer.lp().keywordToken("func");
      break;
    case "ExportedGlobal":
      writer.lp().keywordToken("global");
      break;
    case "ExportedMemory":
      writer.lp().keywordToken("memory");
      break;
    case "ExportedTable":
      writer.lp().keywordToken("table");
      break;
    default:
      // @ts-expect-error
      throw new Error(`invalid kind: ${node.kind}`);
  }
  unparseIndex(node.index, writer);
  writer.rp();
}

function unparseType(node: TypeNode, writer: Writer) {
  writer.pushLine().lp().keywordToken("type");
  unparseId(node.id, writer);
  unparseFuncType(node.funcType, writer);
  writer.rp();
}

function unparseFunc(node: FuncNode, writer: Writer) {
  writer.pushLine().lp().keywordToken("func");
  unparseId(node.id, writer);
  unparseFuncSig(node.signature, writer);
  node.locals.forEach(l => unparseLocalVar(l, writer));
  unparseExpr(node.instructions, writer);
  writer.rp();
}

function unparseTable(node: TableNode, writer: Writer) {
  writer.pushLine().lp().keywordToken("table");
  unparseId(node.id, writer);
  if (node.tableType) {
    unparseTableType(node.tableType, writer);
  }
  if (node.elemList) {
    writer.keywordToken("funcref");
    unparseFunctionIndexListForTable(node.elemList, writer);
  }
  writer.rp();
}

function unparseMemory(node: MemoryNode, writer: Writer) {
  writer.pushLine().lp().keywordToken("memory");
  unparseId(node.id, writer);
  unparseLimits(node.limits, writer);
  writer.rp();
}

function unparseGlobal(node: GlobalNode, writer: Writer) {
  writer.pushLine().lp().keywordToken("global");
  unparseId(node.id, writer);
  unparseGlobalType(node.type, writer);
  unparseExpr(node.expr, writer);
  writer.rp();
}

function unparseExport(node: ExportNode, writer: Writer) {
  writer.pushLine().lp().keywordToken("export");
  unparseName(node.name, writer);
  unparseExportSec(node.sec, writer);
  writer.rp();
}

function unparseElem(node: ElemNode, writer: Writer) {
  writer.pushLine().lp().keywordToken("elem");
  unparseId(node.id, writer);
  writer.indent();
  writer.pushLine().lp().keywordToken("offset");
  unparseExpr(node.offsetExpr, writer);
  writer.rp();
  writer.pushLine();
  unparseFunctionIndexListForElem(node.elemList, writer);
  writer.unindent();
  writer.rp();
}

function unparseModuleBody(node: ModuleBodyNode, writer: Writer) {
  switch (node.kind) {
    case "Type":
      return unparseType(node, writer);
    case "Func":
      return unparseFunc(node, writer);
    case "Table":
      return unparseTable(node, writer);
    case "Memory":
      return unparseMemory(node, writer);
    case "Global":
      return unparseGlobal(node, writer);
    case "Export":
      return unparseExport(node, writer);
    case "Elem":
      return unparseElem(node, writer);
    default:
      // @ts-expect-error
      throw new Error(`unknow kind: ${node.kind}`);
  }
}

function unparseModule(moduleNode: ModuleNode, writer: Writer) {
  writer.pushLine().lp().keywordToken("module");
  writer.indent();
  moduleNode.body.forEach(b => unparseModuleBody(b, writer));
  writer.unindent();
  writer.rp();
}

export function unparse(moduleNode: ModuleNode) {
  const writer = new Writer();
  unparseModule(moduleNode, writer);
  return writer.dump();
}
