import { Position } from "./types";

export function loc(first: Position, ...args: Position[]) {
  if (!args.length) return first;
  const last = args[args.length - 1];
  return {
    loc: {
      pos: first.loc?.pos,
      end: last.loc?.end,
    },
  } as Position;
}
