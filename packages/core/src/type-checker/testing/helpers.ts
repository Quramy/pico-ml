import {
  IntType,
  FloatType,
  BoolType,
  TypeParameterType,
  TypeValue,
  FunctionType,
  TypeEquation,
  ListType,
  TypeSubstitution,
  TypeScheme,
} from "../types";

const referencedFrom = {};

export const int = (): IntType => ({
  kind: "Int",
  referencedFrom,
});

export const float = (): FloatType => ({
  kind: "Float",
  referencedFrom,
});

export const bool = (): BoolType => ({
  kind: "Bool",
  referencedFrom,
});

export const list = (elementType: TypeValue): ListType => ({
  kind: "List",
  elementType,
  referencedFrom,
});

export const param = (id: number): TypeParameterType => ({
  kind: "TypeParameter",
  id,
  referencedFrom,
});

export const func = (paramType: TypeValue, returnType: TypeValue): FunctionType => ({
  kind: "Function",
  paramType,
  returnType,
  referencedFrom,
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
