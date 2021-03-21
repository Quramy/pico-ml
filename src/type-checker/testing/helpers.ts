import {
  IntType,
  BoolType,
  TypeParameterType,
  TypeValue,
  FunctionType,
  TypeEquation,
  ListType,
  TypeSubstitution,
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

export const equation = (lhs: TypeValue, rhs: TypeValue): TypeEquation => ({
  lhs,
  rhs,
});

export const substitution = (from: TypeParameterType, to: TypeValue): TypeSubstitution => ({
  from,
  to,
});
