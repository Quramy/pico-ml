import type { Observable, BehaviorSubject } from "rxjs";
import { combineLatest, Subject } from "rxjs";
import { map, scan, share, debounceTime, switchMap, withLatestFrom } from "rxjs/operators";
import {
  toHex,
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
  toFloat,
  toList,
  IntType,
  FloatType,
  BoolType,
  ListType,
  FunctionType,
  TypeParameterType,
  location2pos,
  Node,
  mlVisitorKeys,
  createVisitorFunctions,
} from "pico-ml";
import { SettingsService } from "./settings";

export interface Diagnostic {
  readonly row: number;
  readonly column: number;
  readonly type: "error";
  readonly text: string;
}

type IntValueType = IntType & {
  value: number;
};

type FloatValueType = FloatType & {
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

export type ValueTypeTree =
  | IntValueType
  | FloatValueType
  | BoolValueType
  | ListValueType
  | FunctionValueType
  | TypeValueType;

function createFormatter(instance: WebAssembly.Instance, pt: TypeValue): (value: number) => ValueTypeTree {
  if (pt.kind === "Int") {
    return (value: number) => ({ ...pt, value: toNumber(instance, value) });
  } else if (pt.kind === "Float") {
    return (value: number) => ({ ...pt, value: toFloat(instance, value) });
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

const typePrinter = createTypePrinter();

const { forEachChild, visitEachChild } = createVisitorFunctions(mlVisitorKeys);

type ExtendedExpressionNode = ExpressionNode & {
  typeInfo?: string;
};

function createExtendedAstTree(
  parseResult: ParseResult<ExpressionNode>,
  typeMapResult: Result<Map<string, TypeValue>, ParseError | TypeError>,
) {
  return parseResult.map(rootNode => {
    if (!typeMapResult.ok) {
      return rootNode;
    }
    const typeMap = typeMapResult.value;
    const visitor = (node: ExpressionNode): ExtendedExpressionNode => {
      const x = visitEachChild(node, visitor);
      if (!node._nodeId) return x;
      const typeValue = typeMap.get(node._nodeId);
      if (!typeValue) return x;
      return {
        typeInfo: typePrinter(typeValue),
        ...x,
      };
    };
    return visitor(rootNode);
  });
}

export interface Location {
  readonly line: number;
  readonly character: number;
}

export interface Program {
  readonly initialContent: string;
  readonly rawCode$: Subject<string>;
  readonly code$: Subject<string>;
  readonly selection$: Subject<{ readonly start: Location; readonly end: Location }>;
  readonly execute$: Subject<boolean | null>;
  readonly selectedAstNode$: Observable<Result<{ readonly path: string[]; readonly found: Node | null }>>;
  readonly parseResult$: Observable<ParseResult<ExpressionNode>>;
  readonly primaryType$: Observable<Result<TypeValue, ParseError | TypeError>>;
  readonly ast$: Observable<Result<ExtendedExpressionNode, ParseError>>;
  readonly typeValueMap$: Observable<Result<Map<string, TypeValue>, ParseError | TypeError>>;
  readonly diagnostics$: Observable<readonly Diagnostic[]>;
  readonly wat$: Observable<Result<string>>;
  readonly wasm$: Observable<Result<Uint8Array>>;
  readonly evaluatedResult$: Observable<
    ({ type: "success"; value: ValueTypeTree } | { type: "error"; message: string })[]
  >;
}

export type CreateProgramOptions = {
  readonly code$: BehaviorSubject<string>;
  readonly settingsService: SettingsService;
};

export function createProgram({ code$, settingsService }: CreateProgramOptions) {
  const rawCode$ = new Subject<string>();
  const execute$ = new Subject<null | boolean>();
  const parseResult$ = code$.asObservable().pipe(debounceTime(100), map(parse), share());
  const selection$ = new Subject<{ readonly start: Location; readonly end: Location }>();

  const selectedAstNode$ = combineLatest(selection$, code$, parseResult$).pipe(
    debounceTime(50),
    map(([selectedRange, code, parseResult]) => {
      return parseResult.map(ast => {
        const pos = location2pos(code, selectedRange.start);
        const end = location2pos(code, selectedRange.end);
        let found: Node | null = null;
        const selectedPath: string[] = [];
        const visitor = (node: Node) => {
          if ((node.loc?.pos ?? Number.MAX_SAFE_INTEGER) <= pos && end <= (node.loc?.end ?? -1)) {
            found = node;
            selectedPath.push(node._nodeId!);
          }
          forEachChild(node, visitor);
        };
        visitor(ast);
        return { path: selectedPath, found };
      });
    }),
    share(),
  );

  const primaryTypeResult$ = parseResult$.pipe(
    map(pr => pr.error(err => ({ ...err, messageWithTypes: undefined })).mapValue(getPrimaryType)),
    share(),
  );
  const typeValueMap$ = primaryTypeResult$.pipe(map(ptr => ptr.map(v => v.typeValueMap)));
  const primaryType$ = primaryTypeResult$.pipe(map(ptr => ptr.map(v => v.rootPrimaryType.expressionType)));
  const ast$ = combineLatest(parseResult$, typeValueMap$).pipe(
    map(([pr, tvmr]) => createExtendedAstTree(pr, tvmr)),
    share(),
  );
  const compileResult$ = combineLatest(parseResult$, typeValueMap$, settingsService.settings$).pipe(
    map(([pr, tvmr, { dispatchUsingInferredType, reduceInstructions }]) =>
      mapValue(
        pr,
        tvmr,
      )((expression, typeValueMap) =>
        compile(expression, { typeValueMap, dispatchUsingInferredType, reduceInstructions }),
      ),
    ),
    share(),
  );
  const wat$ = compileResult$.pipe(
    map(cr => cr.map(printAST)),
    share(),
  );
  const wasm$ = combineLatest([compileResult$, settingsService.settings$]).pipe(
    map(([cr, { enableNameSection }]) => cr.mapValue(mod => generateBinary(mod, { enableNameSection }))),
  );
  const diagnostics$ = combineLatest(code$, primaryType$).pipe(
    map(([code, ptr]) => {
      if (!ptr.ok) {
        const { line, character } = pos2location(code, ptr.value.occurence.loc!.pos);
        const text = ptr.value.messageWithTypes ? ptr.value.messageWithTypes(typePrinter) : ptr.value.message;
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
    share(),
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
    initialContent: code$.getValue(),
    rawCode$,
    code$,
    execute$,
    selection$,
    selectedAstNode$,
    parseResult$,
    typeValueMap$,
    ast$,
    primaryType$,
    diagnostics$,
    wat$,
    wasm$,
    evaluatedResult$,
  };
  return program;
}
