import type { Observable } from "rxjs";
import { useEffect, useContext, useState } from "react";
import { Result, ok } from "pico-ml";

import { Program } from "../service/program";
import { programContext } from "../context/program-context";

type StreamValue<X> = X extends Observable<infer S> ? S : never;
type ResultValue<X> = X extends Result<infer S, any> ? S : never;
type ResultError<X> = X extends Result<any, infer S> ? S : never;

type ProgramKey = keyof Program;

function isObservable(x: any): x is Observable<any> {
  return typeof x === "object" && x["subscribe"];
}

function isResult(x: any): x is Result<any, any> {
  return typeof x === "object" && typeof x["ok"] === "boolean";
}

type UseProgramStreamResult<V, E> =
  | { readonly ready: false; readonly data: null; readonly error: null }
  | { readonly ready: true; readonly data: null; readonly error: E }
  | { readonly ready: true; readonly data: V; readonly error: null };

export function useProgramStream<
  K extends ProgramKey,
  S extends Program[K],
  R extends StreamValue<S>,
  V extends ResultValue<R>,
  E extends ResultError<R>,
>(key: K, initialValue?: V): UseProgramStreamResult<V, E> {
  const program = useContext(programContext);
  const [state, setState] = useState<Result<V, E> | null>(initialValue ? ok(initialValue) : null);
  useEffect(() => {
    const stream = program[key];
    if (!isObservable(stream)) {
      throw new Error(`${key} is not Observable`);
    }
    const subscription = stream.subscribe(v => {
      if (isResult(v)) {
        setState(v);
      }
    });
    return () => subscription.unsubscribe();
  }, []);
  const ret: UseProgramStreamResult<V, E> = !state
    ? {
        ready: false,
        data: null,
        error: null,
      }
    : state.ok
    ? {
        ready: true,
        data: state.value,
        error: null,
      }
    : {
        ready: true,
        data: null,
        error: state.value,
      };
  return ret;
}
