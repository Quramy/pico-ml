import { TypeEquation, TypeSubstitution, TypeValue } from "./types";

function substituteTypeInner(type: TypeValue, substitution: TypeSubstitution): TypeValue {
  switch (type.kind) {
    case "Int":
    case "Bool":
      return type;
    case "TypeParameter":
      return type.id === substitution.from.id ? substitution.to : type;
    case "Function":
      return {
        kind: "Function",
        paramType: substituteType(type.paramType, substitution),
        returnType: substituteType(type.returnType, substitution),
      };
    case "List":
      return {
        kind: "List",
        elementType: substituteType(type.elementType, substitution),
      };
  }
}

export function substituteType(type: TypeValue, ...substitutions: readonly TypeSubstitution[]): TypeValue {
  return substitutions.reduce((t, s) => substituteTypeInner(t, s), type);
}

export function substituteEquationSet(
  equationSet: readonly TypeEquation[],
  substitution: TypeSubstitution,
): readonly TypeEquation[] {
  return equationSet.map(eq => ({
    lhs: substituteType(eq.lhs, substitution),
    rhs: substituteType(eq.rhs, substitution),
  }));
}

export function composite(
  substitutions: readonly TypeSubstitution[],
  substitution: TypeSubstitution,
): readonly TypeSubstitution[] {
  const s: TypeSubstitution = {
    from: substitution.from,
    to: substitutions.reduce((t, ss) => substituteType(t, ss), substitution.to),
  };
  return [s, ...substitutions];
}
