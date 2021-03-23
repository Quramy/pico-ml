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

export function unwrap<T, E extends ResultErrorBase>(result: Result<T, E>): T {
  if (!result.ok) {
    throw new Error(result.value.message);
  }
  return result.value;
}

export function mapValues<T, E extends ResultErrorBase>(...results: Result<T, E>[]) {
  return <S, F extends ResultErrorBase>(cb: (...values: T[]) => Result<S, F>): Result<S, E | F> => {
    const values: T[] = [];
    for (const result of results) {
      if (!result.ok) {
        return result;
      }
      values.push(result.value);
    }
    return cb(...values);
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
    mapValues<T, E extends ResultErrorBase>(...results: Result<T, E>[]) {
      return mapValues(...results);
    },
    ok(value: T) {
      return {
        ok: true,
        value,
      } as R;
    },
    error(err: E) {
      return {
        ok: false,
        value: err,
      } as R;
    },
  };
  return obj;
}
