import { TypeValue, TypeSubstitution } from "./types";
import { getResolvedTypeVariables } from "./ftv";

const priorityMap: {
  [P in TypeValue["kind"]]: number;
} = {
  Bool: 0,
  Int: 0,
  TypeParameter: 0,
  List: 10,
  Function: 20,
};

function idToAlpha(id: number) {
  let ret = [String.fromCharCode(97 + (id % 26))];
  while ((id = ~~(id / 26))) {
    const d = id % 26;
    ret.unshift(String.fromCodePoint(96 + d));
  }
  return "'" + ret.join("");
}

type Context = {
  idMap(id: number): number;
};

function group(parent: TypeValue, child: TypeValue, ctx: Context) {
  const fragment = printType(child, ctx);
  if (priorityMap[child.kind] <= priorityMap[parent.kind]) {
    return fragment;
  } else {
    return `(${fragment})`;
  }
}

function weakGroup(parent: TypeValue, child: TypeValue, ctx: Context) {
  const fragment = printType(child, ctx);
  if (priorityMap[child.kind] < priorityMap[parent.kind]) {
    return fragment;
  } else {
    return `(${fragment})`;
  }
}

function printType(type: TypeValue, ctx: Context): string {
  switch (type.kind) {
    case "Int":
      return "int";
    case "Bool":
      return "bool";
    case "TypeParameter":
      return idToAlpha(ctx.idMap(type.id));
    case "List":
      return `${group(type, type.elementType, ctx)} list`;
    case "Function":
      return `${weakGroup(type, type.paramType, ctx)} -> ${group(type, type.returnType, ctx)}`;
  }
}

export type TypePrinterOptions = {
  readonly remapWithSubstitutions?: readonly TypeSubstitution[];
};

export function createTypePrinter(opts: TypePrinterOptions = {}) {
  const solvedVariables = opts.remapWithSubstitutions && getResolvedTypeVariables(opts.remapWithSubstitutions);
  const solvedIds =
    solvedVariables &&
    solvedVariables.reduce((acc, v) => {
      acc[v.id] = true;
      return acc;
    }, [] as (boolean | undefined)[]);
  const ctx: Context = {
    idMap(id) {
      if (!solvedIds) return id;
      solvedIds[id] = undefined;
      const shift = solvedIds.slice(0, id).reduce((n, solved) => (solved ? n + 1 : n), 0);
      return id - shift;
    },
  };
  return (type: TypeValue) => printType(type, ctx);
}
