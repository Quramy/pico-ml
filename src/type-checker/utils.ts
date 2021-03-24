import { ok, error, Result } from "../structure";
import { MatchPatternNode } from "../parser";
import { TypeValue, TypeParameterType, TypeEnvironment, TypeScheme } from "./types";
import { createChildEnvironment } from "./type-environment";

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

export function schemeFromType(type: TypeValue): TypeScheme {
  return {
    kind: "TypeScheme",
    type,
    variables: [],
  };
}

export function getTypeEnvForPattern(
  pattern: MatchPatternNode,
  elementType: TypeParameterType,
  env: TypeEnvironment,
  names: readonly string[] = [],
): Result<TypeEnvironment> {
  if (pattern.kind === "IdPattern") {
    if (names.some(n => n === pattern.identifier.name)) {
      return error({ message: `Duplicated identifier, '${pattern.identifier.name}'.` });
    }
    return ok(createChildEnvironment(pattern.identifier, schemeFromType({ kind: "List", elementType }), env));
  }
  if (pattern.kind !== "ListConsPattern") return ok(env);
  if (pattern.head.kind === "IdPattern") {
    const name = pattern.head.identifier.name;
    if (names.some(n => n === name)) {
      return error({ message: `Duplicated identifier, '${name}'.` });
    }
    return getTypeEnvForPattern(
      pattern.tail,
      elementType,
      createChildEnvironment(pattern.head.identifier, schemeFromType(elementType), env),
      [...names, name],
    );
  } else {
    return getTypeEnvForPattern(pattern.tail, elementType, env, names);
  }
}
