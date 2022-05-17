import { ExprNode, FuncNode, IdentifierNode, factory } from "../wasm";
import { DefinitionStack } from "./types";
import { paramTypeForEnv } from "./assets/modules/env";

export class MatcherDefinitionStack implements DefinitionStack<ExprNode, IdentifierNode> {
  private funcNodes: FuncNode[] = [];

  enter() {
    return this.funcNodes.length;
  }

  leave(expr: ExprNode) {
    const funcName = factory.identifier(`__matcher_${this.funcNodes.length}__`);
    const funcNode = factory.func(
      factory.funcSig(
        [paramTypeForEnv(), factory.paramType(factory.valueType("i32"), factory.identifier("value"))],
        [factory.valueType("i32")],
      ),
      [],
      expr,
      funcName,
    );
    this.funcNodes.push(funcNode);
    return funcName;
  }

  buildFuncs(): readonly FuncNode[] {
    return this.funcNodes.slice();
  }
}
