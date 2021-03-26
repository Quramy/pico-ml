import { Result, TraverserCallbackFn } from "../structure";
import { ExpressionNode, IdentifierNode } from "../parser";

export interface TypeValueBase<T> {
  readonly kind: T;
}

export interface IntType extends TypeValueBase<"Int"> {}

export interface BoolType extends TypeValueBase<"Bool"> {}

export interface TypeParameterType extends TypeValueBase<"TypeParameter"> {
  readonly id: number;
}

export interface ListType extends TypeValueBase<"List"> {
  readonly elementType: TypeValue;
}

export interface FunctionType extends TypeValueBase<"Function"> {
  readonly paramType: TypeValue;
  readonly returnType: TypeValue;
}

export type TypeValue = IntType | BoolType | TypeParameterType | ListType | FunctionType;

export interface TypeScheme {
  readonly kind: "TypeScheme";
  readonly variables: readonly TypeParameterType[];
  readonly type: TypeValue;
}

export interface TypeEnvironment {
  readonly kind: "TypeEnvironment";
  get(id: IdentifierNode): TypeScheme | undefined;
  parent(): { readonly value: TypeScheme; readonly env: TypeEnvironment } | undefined;
  map(cb: (value: TypeScheme) => TypeScheme): TypeEnvironment;
}

export interface TypeParemeterGenerator {
  gen(): TypeParameterType;
}

export interface PrimaryTypeContext {
  readonly generator: TypeParemeterGenerator;
  readonly env: TypeEnvironment;
}

export interface TypeEquation {
  readonly lhs: TypeValue;
  readonly rhs: TypeValue;
}

export interface TypeSubstitution {
  readonly from: TypeParameterType;
  readonly to: TypeValue;
}

export type UnifiedResult = Result<readonly TypeSubstitution[]>;

export interface PrimaryTypeValue {
  readonly substitutions: readonly TypeSubstitution[];
  readonly expressionType: TypeValue;
}

export type PrimaryTypeResult = Result<PrimaryTypeValue>;

export type PrimaryTypeNode<K extends ExpressionNode["kind"]> = TraverserCallbackFn<
  ExpressionNode,
  PrimaryTypeContext,
  PrimaryTypeResult,
  K
>;
