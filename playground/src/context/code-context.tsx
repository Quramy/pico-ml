import React, { createContext } from "react";
import { Observable, Subject, BehaviorSubject, combineLatest } from "rxjs";
import { map, throttleTime } from "rxjs/operators";
import {
  parse,
  Result,
  ParseResult,
  ExpressionNode,
  getPrimaryType,
  compile,
  generateBinary,
  printAST,
  mapValue,
} from "pico-ml";

export type CodeContextValue = {
  readonly initialContent: string;
  readonly code$: Subject<string>;
  readonly parseResult$: Observable<ParseResult<ExpressionNode>>;
  readonly wat$: Observable<Result<string>>;
  readonly wasm$: Observable<Result<Uint8Array>>;
};

type Props = {
  readonly initialContent: string;
  readonly children: React.ReactNode;
};

const context = createContext<CodeContextValue>(null as any);
const Provider = context.Provider;

export function CodeProvider({ initialContent, children }: Props) {
  const code$ = new BehaviorSubject(initialContent);
  const parseResult$ = code$.asObservable().pipe(map(parse));
  const primaryType$ = parseResult$.pipe(map(pr => pr.mapValue(getPrimaryType)));
  const compileResult$ = combineLatest(parseResult$.pipe(throttleTime(100)), primaryType$.pipe(throttleTime(100))).pipe(
    map(([pr, ptr]) => {
      return mapValue(pr, ptr)(expression => compile(expression));
    }),
  );
  const wat$ = compileResult$.pipe(map(cr => cr.map(printAST)));
  const wasm$ = compileResult$.pipe(map(cr => cr.mapValue(generateBinary)));
  const ctxValue: CodeContextValue = {
    initialContent,
    code$,
    parseResult$,
    wat$,
    wasm$,
  };
  return <Provider value={ctxValue}>{children}</Provider>;
}

export const codeContext = context;
