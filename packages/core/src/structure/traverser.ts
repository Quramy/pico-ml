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

function isTree(x: any): x is Tree<any> {
  return typeof x === "object" && typeof x["kind"] === "string";
}

export function createVisitorFunctions(visitorKeys: readonly string[]) {
  const forEachChild = <T extends Tree>(root: T, cb: (node: T) => void) => {
    for (const key of visitorKeys) {
      const childOrChildren = (root as any)[key];
      if (!childOrChildren) continue;
      if (Array.isArray(childOrChildren)) {
        childOrChildren.forEach(x => {
          if (!isTree(x)) return;
          cb(x as T);
        });
      } else if (isTree(childOrChildren)) {
        cb(childOrChildren as T);
      }
    }
  };

  const visitEachChild = <T extends Tree>(root: T, cb: (node: T) => T | readonly T[] | void | null) => {
    const ret = { ...root } as any;
    for (const key of visitorKeys) {
      const childOrChildren = (root as any)[key];
      if (!childOrChildren) continue;
      if (Array.isArray(childOrChildren)) {
        const newChildren = childOrChildren.reduce((acc, x) => {
          if (!isTree(x)) return [...acc, x];
          const newChild = cb(x as T);
          if (newChild === null) return acc;
          if (!newChild) return [...acc, x];
          if (!Array.isArray(newChild)) return [...acc, newChild];
          return [...acc, ...newChild];
        }, [] as T[]);
        ret[key] = newChildren;
      } else if (isTree(childOrChildren)) {
        const newChild = cb(childOrChildren as T);
        if (newChild) {
          ret[key] = newChild;
        }
      }
    }
    return ret as T;
  };
  return { forEachChild, visitEachChild };
}
