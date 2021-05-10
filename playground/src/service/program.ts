import { Observable, Subject, BehaviorSubject, combineLatest } from "rxjs";
import { map, throttleTime } from "rxjs/operators";
import {
  parse,
  Result,
  ParseResult,
  ExpressionNode,
  ParseError,
  TypeValue,
  TypeError,
  createTypePrinter,
  getPrimaryType,
  compile,
  generateBinary,
  printAST,
  mapValue,
  pos2location,
} from "pico-ml";

export interface Diagnostic {
  readonly row: number;
  readonly column: number;
  readonly type: "error";
  readonly text: string;
}

export interface Program {
  readonly initialContent: string;
  readonly code$: Subject<string>;
  readonly parseResult$: Observable<ParseResult<ExpressionNode>>;
  readonly primaryType$: Observable<Result<TypeValue, ParseError | TypeError>>;
  readonly diagnostics$: Observable<readonly Diagnostic[]>;
  readonly wat$: Observable<Result<string>>;
  readonly wasm$: Observable<Result<Uint8Array>>;
}

export type CreateProgramOptions = {
  readonly initialContent: string;
};

export function createProgram({ initialContent }: CreateProgramOptions) {
  const code$ = new BehaviorSubject(initialContent);
  const parseResult$ = code$.asObservable().pipe(map(parse));
  const primaryType$ = parseResult$.pipe(
    map(pr =>
      pr
        .error(err => ({ ...err, messageWithTypes: undefined }))
        .mapValue(getPrimaryType)
        .map(({ expressionType }) => expressionType),
    ),
  );
  const compileResult$ = combineLatest(parseResult$.pipe(throttleTime(100)), primaryType$.pipe(throttleTime(100))).pipe(
    map(([pr, ptr]) => mapValue(pr, ptr)(expression => compile(expression))),
  );
  const wat$ = compileResult$.pipe(map(cr => cr.map(printAST)));
  const wasm$ = compileResult$.pipe(map(cr => cr.mapValue(generateBinary)));
  const diagnostics$ = combineLatest(code$, primaryType$).pipe(
    map(([code, ptr]) => {
      if (!ptr.ok) {
        const { line, character } = pos2location(code, ptr.value.occurence.loc!.pos);
        const text = ptr.value.messageWithTypes ? ptr.value.messageWithTypes(createTypePrinter()) : ptr.value.message;
        const diagnostic: Diagnostic = {
          type: "error",
          text,
          row: line,
          column: character,
        };
        return [diagnostic];
      } else {
        return [];
      }
    }),
  );
  const program: Program = {
    initialContent,
    code$,
    parseResult$,
    primaryType$,
    diagnostics$,
    wat$,
    wasm$,
  };
  return program;
}
