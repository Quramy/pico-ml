import {
  IntType,
  BoolType,
  TypeParameterType,
  TypeValue,
  FunctionType,
  TypeEquation,
  ListType,
  TypeSubstitution,
  TypeScheme,
} from "../types";

export const int = (): IntType => ({
  kind: "Int",
});

export const bool = (): BoolType => ({
  kind: "Bool",
});

export const list = (elementType: TypeValue): ListType => ({
  kind: "List",
  elementType,
});

export const param = (id: number): TypeParameterType => ({
  kind: "TypeParameter",
  id,
});

export const func = (paramType: TypeValue, returnType: TypeValue): FunctionType => ({
  kind: "Function",
  paramType,
  returnType,
});

export const scheme = (type: TypeValue, variables: readonly TypeParameterType[]): TypeScheme => ({
  kind: "TypeScheme",
  type,
  variables,
});

export const equation = (lhs: TypeValue, rhs: TypeValue): TypeEquation => ({
  lhs,
  rhs,
});

export const substitution = (from: TypeParameterType, to: TypeValue): TypeSubstitution => ({
  from,
  to,
});
