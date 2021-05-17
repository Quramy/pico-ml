import { Result, ok, all, mapValue } from "../../../structure";
import {
  ModuleNode,
  TypeNode,
  FuncNode,
  TableNode,
  MemoryNode,
  GlobalNode,
  ExportNode,
  ElemNode,
} from "../../ast-types";
import { Module, Func, TableType, Names } from "../../structure-types";
import { RefereneceContext, createIndex } from "../ref";
import { convertType } from "./typedef";
import { convertFunc } from "./func";
import { convertTable } from "./table";
import { convertMemory } from "./memory";
import { convertGlobalNode } from "./global";
import { convertExport } from "./export";
import { convertElem } from "./elem";

function group(node: ModuleNode) {
  const refCtx: RefereneceContext = {
    types: new Map(),
    funcs: new Map(),
    globals: new Map(),
    elem: new Map(),
    mems: new Map(),
    tables: new Map(),
    funcLocals: new Map(),
  };

  const typedefNodes: TypeNode[] = [];
  const funcNodes: FuncNode[] = [];
  const tableNodes: TableNode[] = [];
  const memNodes: MemoryNode[] = [];
  const exportNodes: ExportNode[] = [];
  const globalNodes: GlobalNode[] = [];
  const elemNodes: ElemNode[] = [];

  for (const field of node.body) {
    switch (field.kind) {
      case "Type":
        typedefNodes.push(field);
        break;
      case "Func":
        funcNodes.push(field);
        break;
      case "Table":
        tableNodes.push(field);
        break;
      case "Memory":
        memNodes.push(field);
        break;
      case "Export":
        exportNodes.push(field);
        break;
      case "Global":
        globalNodes.push(field);
        break;
      case "Elem":
        elemNodes.push(field);
        break;
    }
  }

  createIndex(typedefNodes, refCtx.types);
  createIndex(funcNodes, refCtx.funcs);
  createIndex(tableNodes, refCtx.tables);
  createIndex(memNodes, refCtx.mems);
  createIndex(globalNodes, refCtx.globals);
  createIndex(elemNodes, refCtx.elem);

  return {
    typedefNodes,
    funcNodes,
    tableNodes,
    memNodes,
    globalNodes,
    exportNodes,
    elemNodes,
    refCtx,
  };
}

function names(refCtx: RefereneceContext): Names {
  return {
    kind: "Names",
    funcs: [...refCtx.funcs.entries()].map(([name, idx]) => ({
      kind: "NameAssociation",
      idx,
      name,
    })),
    locals: [...refCtx.funcLocals.entries()].map(([idx, localMap]) => ({
      kind: "IndirectNameMap",
      idx,
      nameMap: [...localMap.entries()].map(([name, idx]) => ({
        kind: "NameAssociation",
        idx,
        name,
      })),
    })),
  };
}

export function convertModule(node: ModuleNode): Result<Module> {
  const { typedefNodes, funcNodes, tableNodes, memNodes, globalNodes, exportNodes, elemNodes, refCtx } = group(node);
  return all(typedefNodes.map(node => convertType(node))).mapValue(types =>
    mapValue(
      all(memNodes.map(node => convertMemory(node))),
      funcNodes.reduce(
        (acc, node, i) => acc.mapValue(state => convertFunc(node, i, state, refCtx)),
        ok({ funcs: [] as readonly Func[], types }),
      ),
      all(elemNodes.map(node => convertElem(node, refCtx))),
      all(exportNodes.map(node => convertExport(node, refCtx))),
      all(globalNodes.map(node => convertGlobalNode(node, refCtx))),
    )((mems, { funcs, types }, elems, exports, globals) =>
      tableNodes
        .reduce(
          (acc, node) => acc.mapValue(state => convertTable(node, state, refCtx)),
          ok({ tables: [] as readonly TableType[], elems }),
        )
        .map(({ tables, elems }) => ({
          kind: "Module",
          names: names(refCtx),
          types,
          funcs,
          tables,
          mems,
          globals,
          exports,
          elems,
        })),
    ),
  );
}
