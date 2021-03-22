import { TypeValue } from "./types";

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
