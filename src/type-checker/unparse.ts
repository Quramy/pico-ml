import { TypeValue } from "./types";

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

function group(parent: TypeValue, child: TypeValue) {
  const fragment = printType(child);
  if (priorityMap[child.kind] <= priorityMap[parent.kind]) {
    return fragment;
  } else {
    return `(${fragment})`;
  }
}

function printType(type: TypeValue): string {
  switch (type.kind) {
    case "Int":
      return "int";
    case "Bool":
      return "bool";
    case "TypeParameter":
      return idToAlpha(type.id);
    case "List":
      return `${group(type, type.elementType)} list`;
    case "Function":
      return `${group(type, type.paramType)} -> ${group(type, type.returnType)}`;
  }
}

export function createTypePrinter() {
  return (type: TypeValue) => printType(type);
}
