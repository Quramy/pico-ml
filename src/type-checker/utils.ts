import { ok, error, Result } from "../structure";
import { MatchPatternNode } from "../parser";
import { TypeValue, TypeEnvironment, TypeScheme, TypeParemeterGenerator, TypeEquation, TypeError } from "./types";
import { createChildEnvironment } from "./type-environment";
import { MatchExpressionNode, PatternMatchClauseNode, MatchClauseNode } from "../parser/types";

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

export function getPatternMatchClauseList(matchExpression: MatchExpressionNode) {
  const inner = (
    mc: MatchClauseNode,
    list: readonly PatternMatchClauseNode[] = [],
  ): readonly PatternMatchClauseNode[] => {
    if (mc.kind === "PatternMatchClause") {
      return [...list, mc];
    }
    return inner(mc.or, [...list, mc.patternMatch]);
  };
  return inner(matchExpression.matchClause);
}

export function getTypeEnvForPattern(
  pattern: MatchPatternNode,
  valueType: TypeValue,
  typeEnv: TypeEnvironment,
  typeGenerator: TypeParemeterGenerator,
  names: readonly string[] = [],
  equations: readonly TypeEquation[] = [],
): Result<{ typeEnv: TypeEnvironment; equations: readonly TypeEquation[] }, TypeError> {
  if (pattern.kind === "WildcardPattern") {
    return ok({ typeEnv, equations });
  } else if (pattern.kind === "EmptyListPattern") {
    const elementType = typeGenerator.gen(pattern);
    return ok({
      typeEnv,
      equations: [...equations, { lhs: valueType, rhs: { kind: "List", elementType, referencedFrom: pattern } }],
    });
  } else if (pattern.kind === "IdPattern") {
    if (names.some(n => n === pattern.identifier.name)) {
      return error({ message: `Duplicated identifier, '${pattern.identifier.name}'.`, occurence: pattern.identifier });
    }
    return ok({ typeEnv: createChildEnvironment(pattern.identifier, schemeFromType(valueType), typeEnv), equations });
  } else if (pattern.kind === "ListConsPattern") {
    if (pattern.head.kind === "IdPattern") {
      const name = pattern.head.identifier.name;
      if (names.some(n => n === name)) {
        return error({ message: `Duplicated identifier, '${name}'.`, occurence: pattern.head.identifier });
      }
      const elementType = typeGenerator.gen(pattern.head);
      return getTypeEnvForPattern(
        pattern.tail,
        valueType,
        createChildEnvironment(pattern.head.identifier, schemeFromType(elementType), typeEnv),
        typeGenerator,
        [...names, name],
        [...equations, { lhs: valueType, rhs: { kind: "List", elementType, referencedFrom: pattern } }],
      );
    } else {
      return getTypeEnvForPattern(pattern.tail, valueType, typeEnv, typeGenerator, names, equations);
    }
  }
  // @ts-expect-error
  throw new Error(`invalid node kind: ${pattern.kind}`);
}
