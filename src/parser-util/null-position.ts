import { Position, NullPosition } from "./types";
import type { Scanner } from "./scanner";

export function isNullPosition(p: Position): p is NullPosition {
  return (p as any)["_brand"] === "NullPosition";
}

export function fromMaybyNullPosition<T extends Position>(x: T | NullPosition) {
  return <S>(cb: (p: T) => S): S | null => {
    if (isNullPosition(x)) return null;
    return cb(x);
  };
}

export function nullPosition(scanner: Scanner): NullPosition {
  return {
    _brand: "NullPosition",
    loc: {
      pos: scanner.pos,
      end: scanner.pos,
    },
  };
}
