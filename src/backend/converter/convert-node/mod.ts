import { Result, ok, all, error } from "../../../structure";
import { ModuleNode, MemoryNode, TypeNode, FuncNode, IdentifierNode, ExportNode } from "../../ast-types";
import { Module, Func } from "../../structure-types";
import { convertType } from "./typedef";
import { convertMemory } from "./memory";
import { RefereneceContext } from "../ref";
import { convertFunc } from "./func";
import { convertExport } from "./export";

function countup(nodes: readonly { readonly id?: IdentifierNode | null }[], map: Map<string, number>) {
  nodes.forEach((n, index) => {
    if (n.id) {
      map.set(n.id.value, index);
    }
  });
}

export function convertModule(node: ModuleNode): Result<Module> {
  const refCtx: RefereneceContext = {
    types: new Map(),
    funcs: new Map(),
    globals: new Map(),
    elem: new Map(),
    mems: new Map(),
    tables: new Map(),
  };

  const memNodes: MemoryNode[] = [];
  const typedefNodes: TypeNode[] = [];
  const funcNodes: FuncNode[] = [];
  const exportNodes: ExportNode[] = [];
  for (const field of node.body) {
    switch (field.kind) {
      case "Type":
        typedefNodes.push(field);
        break;
      case "Memory":
        memNodes.push(field);
        break;
      case "Func":
        funcNodes.push(field);
        break;
      case "Export":
        exportNodes.push(field);
        break;
    }
  }

  countup(typedefNodes, refCtx.types);
  countup(funcNodes, refCtx.funcs);
  countup(memNodes, refCtx.mems);

  const mems = all(memNodes.map(node => convertMemory(node)));
  if (!mems.ok) return error(mems.value);
  const types = all(typedefNodes.map(node => convertType(node)));
  if (!types.ok) return error(types.value);

  const funcConvertResult = funcNodes.reduce(
    (acc, node) => acc.mapValue(state => convertFunc(node, state, refCtx)),
    ok({ funcs: [] as readonly Func[], types: types.value }),
  );
  if (!funcConvertResult.ok) return error(funcConvertResult.value);

  const exports = all(exportNodes.map(node => convertExport(node, refCtx)));
  if (!exports.ok) return error(exports.value);

  return ok({
    kind: "Module",
    types: funcConvertResult.value.types,
    mems: mems.value,
    funcs: funcConvertResult.value.funcs,
    exports: exports.value,
  });
}
