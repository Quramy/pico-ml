import { useResult, mapValue } from "../structure";
import { TypeEquation, UnifiedResult, TypeValue, TypeParameterType } from "./types";
import { substituteEquationSet, composite } from "./substitute";
import { getFreeTypeVariables } from "./ftv";
import { equal } from "./utils";

const { ok, error: err } = useResult<UnifiedResult>();

const error = (message: string) => err({ message });

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
      return error("This equation does not have solution.");
    }
    const substitution = { from: lhs, to: rhs };
    return mapValue(unify(substituteEquationSet(typeEquationSet, substitution)))(unifined =>
      ok(composite(unifined, substitution)),
    );
  }

  return error("This equation does not have solution.");
}
