import { Observable, Subject, BehaviorSubject, combineLatest } from "rxjs";
import { map, scan, debounceTime, switchMap, withLatestFrom } from "rxjs/operators";
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
  toBoolean,
  toNumber,
  toList,
  IntType,
  ListType,
  BoolType,
  FunctionType,
  TypeParameterType,
} from "pico-ml";
import { toHex } from "../functions/hex";

export interface Diagnostic {
  readonly row: number;
  readonly column: number;
  readonly type: "error";
  readonly text: string;
}

type IntValueType = IntType & {
  value: number;
};

type BoolValueType = BoolType & {
  value: boolean;
};

type FunctionValueType = FunctionType & {
  value: string;
};

type ListValueType = ListType & {
  value: readonly ValueTypeTree[];
};

type TypeValueType = TypeParameterType & {
  value: string;
};

export type ValueTypeTree = IntValueType | BoolValueType | ListValueType | FunctionValueType | TypeValueType;

function createFormatter(instance: WebAssembly.Instance, pt: TypeValue): (value: number) => ValueTypeTree {
  if (pt.kind === "Int") {
    return (value: number) => ({ ...pt, value: toNumber(instance, value) });
  } else if (pt.kind === "Bool") {
    return (value: number) => ({ ...pt, value: toBoolean(instance, value) });
  } else if (pt.kind === "List") {
    const elementConverter = createFormatter(instance, pt.elementType);
    return (value: number) => {
      return { ...pt, value: toList(instance, value).map(elementConverter) };
    };
  } else if (pt.kind === "TypeParameter") {
    return () => ({ ...pt, value: "unknown" });
  } else if (pt.kind === "Function") {
    return (value: number) => ({ ...pt, value: `Closure@${toHex(value, 4)}` });
  }
  // @ts-expect-error
  throw new Error(`${pt.kind}`);
}

export interface Program {
  readonly initialContent: string;
  readonly code$: Subject<string>;
  readonly execute$: Subject<boolean | null>;
  readonly parseResult$: Observable<ParseResult<ExpressionNode>>;
  readonly primaryType$: Observable<Result<TypeValue, ParseError | TypeError>>;
  readonly diagnostics$: Observable<readonly Diagnostic[]>;
  readonly wat$: Observable<Result<string>>;
  readonly wasm$: Observable<Result<Uint8Array>>;
  readonly evaluatedResult$: Observable<
    ({ type: "success"; value: ValueTypeTree } | { type: "error"; message: string })[]
  >;
}

export type CreateProgramOptions = {
  readonly initialContent: string;
};

export function createProgram({ initialContent }: CreateProgramOptions) {
  const code$ = new BehaviorSubject(initialContent);
  const execute$ = new Subject<null | boolean>();
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
    withLatestFrom(combineLatest(primaryType$, wasm$)),
    switchMap(async ([shouldClear, [ptr, bin]]) => {
      if (shouldClear) return { shouldClear: true };
      if (!ptr.ok) return { type: "error", message: ptr.value.message } as const;
      if (!bin.ok) return { type: "error", message: bin.value.message } as const;
      try {
        const { instance } = await WebAssembly.instantiate(bin.value);
        const formatter = createFormatter(instance, ptr.value);
        const value = (instance.exports["main"] as Function)() as number;
        return { type: "success", value: formatter(value) } as const;
      } catch (e) {
        return { type: "error", message: e.message || "unknown error" } as const;
      }
    }),
    scan((acc, value) => (value.shouldClear ? [] : [...acc, value]), [] as any[]),
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
