export interface ResultErrorBase {
  readonly message: string;
}

interface ResultOkForm<T> {
  readonly ok: true;
  readonly value: T;
}

interface ResultErrorForm<E extends ResultErrorBase> {
  readonly ok: false;
  readonly value: E;
}

export type Result<T, E extends ResultErrorBase = ResultErrorBase> = ResultOkForm<T> | ResultErrorForm<E>;

type ResultValue<R extends Result<any, any>> = R extends ResultOkForm<infer T> ? T : never;
type ResultError<R extends Result<any, any>> = R extends ResultErrorForm<infer E> ? E : never;

type ValueTuple<T extends any[]> = {
  [P in keyof T]: T[P] extends Result<any> ? ResultValue<T[P]> : never;
};

type ErrorUnion<T extends any[]> = {
  [P in keyof T]: T[P] extends Result<any> ? ResultError<T[P]> : never;
}[number];

export function unwrap<T, E extends ResultErrorBase>(result: Result<T, E>): T {
  if (!result.ok) {
    throw new Error(result.value.message);
  }
  return result.value;
}

export function mapValue<U extends Result<any, any>[]>(...results: U) {
  return <S, F extends ResultErrorBase>(
    cb: (...values: ValueTuple<U>) => Result<S, F>,
  ): Result<S, F | ErrorUnion<U>> => {
    const values: ValueTuple<U>[number][] = [];
    for (const result of results) {
      if (!result.ok) {
        return result;
      }
      values.push(result.value);
    }
    return cb(...(values as ValueTuple<U>));
  };
}

export function ok<T>(value: T): Result<T, any> {
  return {
    ok: true,
    value,
  };
}

export function error<E extends ResultErrorBase>(value: E): Result<any, E> {
  return {
    ok: false,
    value,
  };
}

export function useResult<R extends Result<any, any>, T = ResultValue<R>, E = ResultError<R>>() {
  const obj = {
    mapValue,
    ok<S extends T>(value: S) {
      return {
        ok: true,
        value,
      } as R;
    },
    error<F extends E>(err: F) {
      return {
        ok: false,
        value: err,
      } as R;
    },
  };
  return obj;
}
