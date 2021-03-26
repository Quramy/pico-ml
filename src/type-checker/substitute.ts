import { TypeEquation, TypeSubstitution, TypeValue, TypeScheme, TypeEnvironment } from "./types";

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

export function substituteScheme(scheme: TypeScheme, ...substitutions: readonly TypeSubstitution[]): TypeScheme {
  return substitutions.reduce((sc, s) => {
    if (sc.variables.some(v => v.id === s.from.id)) {
      return scheme;
    } else {
      return {
        ...scheme,
        type: substituteType(scheme.type, s),
      };
    }
  }, scheme);
}

export function substituteEnv(env: TypeEnvironment, ...substitutions: readonly TypeSubstitution[]): TypeEnvironment {
  return env.map(scheme => substituteScheme(scheme, ...substitutions));
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

export function toEquationSet(...values: { substitutions: readonly TypeSubstitution[] }[]): TypeEquation[] {
  return values.reduce(
    (acc, { substitutions }) => [
      ...acc,
      ...substitutions.map(({ from, to }) => ({
        lhs: from,
        rhs: to,
      })),
    ],
    [] as TypeEquation[],
  );
}
