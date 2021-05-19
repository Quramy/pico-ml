export interface ResultErrorBase {
  readonly message: string;
}

export interface ResultOkForm<T> {
  readonly ok: true;
  readonly value: T;
}

export interface ResultErrorForm<E extends ResultErrorBase> {
  readonly ok: false;
  readonly value: E;
}

export interface ResultCombinator<T, E extends ResultErrorBase> {
  unwrap(): T;
  map<S>(cb: (value: T) => S): Result<S, E>;
  tap(cb: (value: T) => any): Result<T, E>;
  error<F extends ResultErrorBase>(cb: (error: E) => F): Result<T, F>;
  mapValue<S, F extends ResultErrorBase>(cb: (value: T) => Result<S, F>): Result<S, E | F>;
}

export type Result<T, E extends ResultErrorBase = ResultErrorBase> = ResultCombinator<T, E> &
  (ResultOkForm<T> | ResultErrorForm<E>);

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

export function all<T, E extends ResultErrorBase>(results: readonly Result<T, E>[]): Result<readonly T[], E> {
  const values: T[] = [];
  for (const result of results) {
    if (result.ok) {
      values.push(result.value);
    } else {
      return result as any as Result<readonly T[], E>;
    }
  }
  return ok(values) as Result<readonly T[], E>;
}

export function ok<T, E extends ResultErrorBase = ResultErrorBase>(value: T): Result<T, E> {
  const r: Result<T, any> = {
    ok: true,
    value,
    unwrap() {
      return unwrap(r);
    },
    map(cb) {
      return ok(cb(value));
    },
    tap(cb) {
      cb(value);
      return ok(value);
    },
    error() {
      return r;
    },
    mapValue(cb) {
      return cb(value);
    },
  };
  return r;
}

export function error<E extends ResultErrorBase>(value: E): Result<any, E> {
  const r: Result<any, E> = {
    ok: false,
    value,
    unwrap() {
      return unwrap(r);
    },
    map() {
      return r;
    },
    tap() {
      return r;
    },
    error(cb) {
      return error(cb(value));
    },
    mapValue() {
      return r;
    },
  };
  return r;
}

export function useResult<R extends Result<any, any>, T = ResultValue<R>, E = ResultError<R>>() {
  const obj = {
    mapValue,
    ok<S extends T>(value: S) {
      return ok(value) as R;
    },
    error<F extends E>(err: F & ResultErrorBase) {
      return error(err) as R;
    },
  };
  return obj;
}
