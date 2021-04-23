import { Result, ok, all, mapValue } from "../../../structure";
import { ModuleNode, MemoryNode, TypeNode, FuncNode, ExportNode } from "../../ast-types";
import { Module, Func } from "../../structure-types";
import { convertType } from "./typedef";
import { convertMemory } from "./memory";
import { RefereneceContext, createIndex } from "../ref";
import { convertFunc } from "./func";
import { convertExport } from "./export";

function group(node: ModuleNode) {
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

  createIndex(typedefNodes, refCtx.types);
  createIndex(funcNodes, refCtx.funcs);
  createIndex(memNodes, refCtx.mems);
  return {
    typedefNodes,
    funcNodes,
    memNodes,
    exportNodes,
    refCtx,
  };
}

export function convertModule(node: ModuleNode): Result<Module> {
  const { typedefNodes, funcNodes, memNodes, exportNodes, refCtx } = group(node);
  return all(typedefNodes.map(node => convertType(node))).mapValue(types =>
    mapValue(
      all(memNodes.map(node => convertMemory(node))),
      funcNodes.reduce(
        (acc, node) => acc.mapValue(state => convertFunc(node, state, refCtx)),
        ok({ funcs: [] as readonly Func[], types }),
      ),
      all(exportNodes.map(node => convertExport(node, refCtx))),
    )((mems, { funcs, types }, exports) =>
      ok({
        kind: "Module",
        types,
        mems,
        funcs,
        exports,
      }),
    ),
  );
}
