import { Observable, Subject, BehaviorSubject, combineLatest } from "rxjs";
import { map, debounceTime, switchMap, withLatestFrom } from "rxjs/operators";
import {
  parse,
  ok,
  error,
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
  readonly execute$: Subject<null>;
  readonly parseResult$: Observable<ParseResult<ExpressionNode>>;
  readonly primaryType$: Observable<Result<TypeValue, ParseError | TypeError>>;
  readonly diagnostics$: Observable<readonly Diagnostic[]>;
  readonly wat$: Observable<Result<string>>;
  readonly wasm$: Observable<Result<Uint8Array>>;
  readonly evaluatedResult$: Observable<Result<number>>;
}

export type CreateProgramOptions = {
  readonly initialContent: string;
};

export function createProgram({ initialContent }: CreateProgramOptions) {
  const code$ = new BehaviorSubject(initialContent);
  const execute$ = new Subject<null>();
  const parseResult$ = code$.asObservable().pipe(debounceTime(100), map(parse));
  const primaryType$ = parseResult$.pipe(
    map(pr =>
      pr
        .error(err => ({ ...err, messageWithTypes: undefined }))
        .mapValue(getPrimaryType)
        .map(({ expressionType }) => expressionType),
    ),
  );
  const compileResult$ = combineLatest(parseResult$, primaryType$).pipe(
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
  const evaluatedResult$ = execute$.pipe(
    withLatestFrom(wasm$),
    switchMap(async ([_, bin]) => {
      if (!bin.ok) return error({ message: bin.value.message });
      try {
        const { instance } = await WebAssembly.instantiate(bin.value);
        const value = (instance.exports["main"] as Function)() as number;
        return ok(value);
      } catch (e) {
        return error(e) as Result<number>;
      }
    }),
  );
  const program: Program = {
    initialContent,
    code$,
    execute$,
    parseResult$,
    primaryType$,
    diagnostics$,
    wat$,
    wasm$,
    evaluatedResult$,
  };
  return program;
}
