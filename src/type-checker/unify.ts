import { TypeEquation, TypeSubstitution, UnifiedResult, TypeValue, TypeParameterType } from "./types";
import { substituteEquationSet, composite } from "./substitute";
import { equal, getFreeTypeVariables } from "./utils";

function ok(substitutions: readonly TypeSubstitution[]): UnifiedResult {
  return {
    ok: true,
    value: substitutions,
  };
}

function error(message: string): UnifiedResult {
  return {
    ok: false,
    value: {
      message,
    },
  };
}

export function unify(typeEquationSet: readonly TypeEquation[]): UnifiedResult {
  if (typeEquationSet.length === 0) {
    return ok([]);
  }
  const [eq, ...rest] = typeEquationSet;
  if (equal(eq.lhs, eq.rhs)) return unify(rest);
  if (eq.lhs.kind === "Function" && eq.rhs.kind === "Function") {
    return unify([
      ...rest,
      { lhs: eq.lhs.paramType, rhs: eq.rhs.paramType },
      { lhs: eq.lhs.returnType, rhs: eq.rhs.returnType },
    ]);
  }
  if (eq.lhs.kind === "List" && eq.rhs.kind === "List") {
    return unify([...rest, { lhs: eq.lhs.elementType, rhs: eq.rhs.elementType }]);
  }
  let lhs: TypeParameterType | undefined = undefined;
  let rhs: TypeValue | undefined = undefined;
  if (eq.lhs.kind === "TypeParameter") {
    lhs = eq.lhs;
    rhs = eq.rhs;
  }
  if (eq.rhs.kind === "TypeParameter") {
    lhs = eq.rhs;
    rhs = eq.lhs;
  }
  if (lhs != null && rhs != null) {
    const ftv = getFreeTypeVariables(rhs);
    if (ftv.some(v => v.id === lhs?.id)) {
      error("This equation does not have solution.");
    }
    const substitution = { from: lhs, to: rhs };
    const result = unify(substituteEquationSet(typeEquationSet, substitution));
    if (!result.ok) return result;
    return ok(composite(result.value, substitution));
  }

  return error("This equation does not have solution.");
}
