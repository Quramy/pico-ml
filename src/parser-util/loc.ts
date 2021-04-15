import { Position } from ".";

export function loc(...positions: Position[]): Position {
  if (positions.length === 0) {
    return {};
  }
  const [first, ...rest] = positions;
  if (!rest.length) return { loc: first.loc };
  const last = rest[rest.length - 1];
  return {
    loc: {
      pos: first.loc?.pos,
      end: last.loc?.end,
    },
  } as Position;
}
