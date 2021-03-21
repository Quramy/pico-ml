import { IdentifierNode } from "../parser";

export interface TypeValueBase<T> {
  readonly kind: T;
}

export interface IntType extends TypeValueBase<"Int"> {}

export interface BoolType extends TypeValueBase<"Bool"> {}

export interface ListType extends TypeValueBase<"List"> {
  readonly elementType: TypeValue;
}

export interface FunctionType extends TypeValueBase<"Function"> {
  readonly paramType: TypeValue;
  readonly returnType: TypeValue;
}

export interface TypeParameterType extends TypeValueBase<"TypeParameter"> {
  readonly id: number;
}

export type TypeValue = IntType | BoolType | ListType | FunctionType | TypeParameterType;

export interface TypeScheme {}

export interface TypeEnvironment {
  get(id: IdentifierNode): TypeValue | undefined;
}

export interface TypeEquation {
  readonly lhs: TypeValue;
  readonly rhs: TypeValue;
}

export interface TypeSubstitution {
  readonly from: TypeParameterType;
  readonly to: TypeValue;
}

export interface ExtractedValue {
  readonly equationSet: readonly TypeEquation[];
  readonly expressionType: TypeValue;
}

export interface ExtractedFailure {
  readonly message: string;
}

export type ExtractedResult =
  | {
      readonly ok: false;
      readonly value: ExtractedFailure;
    }
  | {
      readonly ok: true;
      readonly value: ExtractedValue;
    };

export interface UnifiedFailure {
  readonly message: string;
}
export type UnifiedResult =
  | {
      readonly ok: true;
      readonly value: readonly TypeSubstitution[];
    }
  | {
      readonly ok: false;
      readonly value: UnifiedFailure;
    };
