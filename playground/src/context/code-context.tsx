import React, { createContext } from "react";
import { Observable, Subject, BehaviorSubject } from "rxjs";
import { map, throttleTime } from "rxjs/operators";
import { parse, Result, ParseResult, ExpressionNode, compile, generateBinary, printAST } from "pico-ml";

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
  const compileResult$ = parseResult$.pipe(
    throttleTime(100),
    map(pr => pr.mapValue(compile)),
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
