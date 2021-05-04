import { factory, FuncNode, ExprNode, ModuleBodyNode, TableNode } from "../wasm";
import { DefinitionStack } from "./types";
import { paramTypeForEnv } from "./assets/modules/env";

function getFunctionIdentifier(funcIndex: number) {
  return factory.identifier(`__fn_${funcIndex}__`);
}

export class FunctionDefinitionStack implements DefinitionStack<ExprNode> {
  private touched = false;
  private funcNodes: FuncNode[] = [];

  enter() {
    if (this.touched) return this.funcNodes.length;
    this.touched = true;
    return this.funcNodes.length;
  }

  leave(expr: ExprNode) {
    const funcIndex = this.funcNodes.length;
    const funcNode = factory.func(
      factory.funcSig([paramTypeForEnv()], [factory.valueType("i32")]),
      [],
      expr,
      getFunctionIdentifier(funcIndex),
    );
    this.funcNodes.push(funcNode);
    return funcIndex;
  }

  buildFuncs(): readonly ModuleBodyNode[] {
    return this.funcNodes.slice();
  }

  buildTables(): readonly TableNode[] {
    if (!this.touched) return [];
    const indices = this.funcNodes.map(f => f.id!);
    const table = factory.tableWithElemList(factory.functionIndexList(indices), factory.identifier("__func_table__"));
    return [table];
  }
}
