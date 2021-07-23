import { wat, factory, FuncNode, LocalVarNode, ExprNode, ModuleBodyNode, TableNode } from "../wasm";
import { DefinitionStack } from "./types";
import { paramTypeForEnv } from "./assets/modules/env";

function getFunctionIdentifier(funcIndex: number) {
  return factory.identifier(`__fn_${funcIndex}__`);
}

export class FunctionDefinitionStack implements DefinitionStack<ExprNode> {
  private touched = false;
  private funcNodes: FuncNode[] = [];
  private localVarNodes: LocalVarNode[] = [];
  private level = 0;

  get isInFunctionDefinition() {
    return this.level > 0;
  }

  enter() {
    this.level++;
    if (this.touched) return this.funcNodes.length;
    this.touched = true;
    return this.funcNodes.length;
  }

  leave(expr: ExprNode) {
    this.level--;
    const funcIndex = this.funcNodes.length;
    const funcNode = factory.func(
      factory.funcSig([paramTypeForEnv()], [factory.valueType("i32")]),
      this.localVarNodes,
      expr,
      getFunctionIdentifier(funcIndex),
    );
    this.funcNodes.push(funcNode);
    this.localVarNodes = [];
    return funcIndex;
  }

  useLocalVar(node: LocalVarNode) {
    if (!node.id) return;
    if (this.localVarNodes.some(n => n.id?.value === node.id!.value)) return;
    this.localVarNodes.push(node);
  }

  buildFuncs(): readonly ModuleBodyNode[] {
    if (!this.touched) return [];
    return [
      factory.typedef(
        factory.funcType([{ ...paramTypeForEnv(), id: null }], [factory.valueType("i32")]),
        factory.identifier("__fn_type__"),
      ),
      ...this.funcNodes.slice(),
    ];
  }

  buildTables(): readonly TableNode[] {
    if (!this.touched) return [];
    const indices = this.funcNodes.map(f => f.id!);
    const table = factory.tableWithElemList(factory.functionIndexList(indices), factory.identifier("__func_table__"));
    return [table];
  }

  callInstr = wat.instructions`
    call_indirect $__func_table__ $__fn_type__
  `;
}
