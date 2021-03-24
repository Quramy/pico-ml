import { Position } from "./types";

export function loc(first: Position, ...args: Position[]) {
  if (!args.length) return { loc: first.loc };
  const last = args[args.length - 1];
  return {
    loc: {
      pos: first.loc?.pos,
      end: last.loc?.end,
    },
  } as Position;
}
