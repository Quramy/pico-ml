import { TypeValue, TypeParameterType } from "./types";

export function equal(a: TypeValue, b: TypeValue): boolean {
  switch (a.kind) {
    case "Int":
    case "Bool":
      return a.kind === b.kind;
    case "Function": {
      if (b.kind !== "Function") return false;
      return equal(a.paramType, b.paramType) && equal(a.returnType, b.returnType);
    }
    case "List": {
      if (b.kind !== "List") return false;
      return equal(a.elementType, b.elementType);
    }
    case "TypeParameter": {
      if (b.kind !== "TypeParameter") return false;
      return a.id === b.id;
    }
  }
}

function getFTVInner(type: TypeValue): TypeParameterType[] {
  switch (type.kind) {
    case "Int":
    case "Bool":
      return [];
    case "TypeParameter":
      return [type];
    case "List":
      return getFTVInner(type.elementType);
    case "Function":
      return [...getFTVInner(type.paramType), ...getFTVInner(type.returnType)];
  }
}

export function getFreeTypeVariables(type: TypeValue): readonly TypeParameterType[] {
  const set = getFTVInner(type).sort((a, b) => a.id - b.id);
  return set.reduce((acc, t) => (acc[0]?.id === t.id ? acc : [t, ...acc]), [] as TypeParameterType[]).reverse();
}
