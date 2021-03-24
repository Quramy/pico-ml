import { mapValue, ok, error, Result } from "../structure";
import { MatchPatternNode } from "../parser";
import { TypeValue, TypeEnvironment, TypeScheme, TypeParemeterGenerator, TypeEquation } from "./types";
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

function getTypeEnvForPatternInner(
  pattern: MatchPatternNode,
  valueType: TypeValue,
  env: TypeEnvironment,
  typeGenerator: TypeParemeterGenerator,
  names: readonly string[],
  equations: TypeEquation[],
): Result<TypeEnvironment> {
  if (pattern.kind === "WildcardPattern") {
    return ok(env);
  } else if (pattern.kind === "EmptyListPattern") {
    const elementType = typeGenerator.gen();
    equations.push({ lhs: valueType, rhs: { kind: "List", elementType } });
    return ok(env);
  } else if (pattern.kind === "IdPattern") {
    if (names.some(n => n === pattern.identifier.name)) {
      return error({ message: `Duplicated identifier, '${pattern.identifier.name}'.` });
    }
    return ok(createChildEnvironment(pattern.identifier, schemeFromType(valueType), env));
  }
  if (pattern.kind !== "ListConsPattern") return ok(env);
  if (pattern.head.kind === "IdPattern") {
    const name = pattern.head.identifier.name;
    if (names.some(n => n === name)) {
      return error({ message: `Duplicated identifier, '${name}'.` });
    }
    const elementType = typeGenerator.gen();
    equations.push({ lhs: valueType, rhs: { kind: "List", elementType } });
    return getTypeEnvForPatternInner(
      pattern.tail,
      valueType,
      createChildEnvironment(pattern.head.identifier, schemeFromType(elementType), env),
      typeGenerator,
      [...names, name],
      equations,
    );
  } else {
    return getTypeEnvForPatternInner(pattern.tail, valueType, env, typeGenerator, names, equations);
  }
}

export function getTypeEnvForPattern(
  pattern: MatchPatternNode,
  elementType: TypeValue,
  env: TypeEnvironment,
  typeGenerator: TypeParemeterGenerator,
): Result<{ typeEnv: TypeEnvironment; equations: readonly TypeEquation[] }> {
  const equations: TypeEquation[] = [];
  return mapValue(getTypeEnvForPatternInner(pattern, elementType, env, typeGenerator, [], equations))(env =>
    ok({ typeEnv: env, equations }),
  );
}
