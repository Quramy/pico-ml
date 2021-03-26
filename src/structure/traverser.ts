export interface Tree<Kind extends string = string> {
  readonly kind: Kind;
}

export type Select<T extends Tree, Kind extends T["kind"]> = T & { kind: Kind };

export type TraverserCallbackFn<T extends Tree, Context, Result, Kind extends T["kind"]> = (
  node: Select<T, Kind>,
  ctx: Context,
  next: (node: T, ctx: Context) => Result,
) => Result;

export type TraverserCallbackFnMap<T extends Tree, Context, Result> = {
  [Kind in T["kind"] as Uncapitalize<Kind>]: TraverserCallbackFn<T, Context, Result, Kind>;
};

export function createTreeTraverser<T extends Tree, Context, Result>(
  nodeFunctions: TraverserCallbackFnMap<T, Context, Result>,
): (node: T, ctx: Context) => Result {
  const fn = (node: T, ctx: Context): Result => {
    const k = node.kind;
    const key = k[0].toLowerCase() + k.slice(1);
    const callback = (nodeFunctions as any)[key];
    if (typeof callback !== "function") throw new Error("invalid kind");
    return callback(node, ctx, fn);
  };
  return fn;
}
