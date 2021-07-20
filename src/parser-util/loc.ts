import { toHex } from "../string-util";
import { Position } from ".";

let nodeId = 0;

function generateLocationToken() {
  const id = ++nodeId;
  return toHex(id, 6);
}

export function loc(...positions: Position[]): Position {
  if (positions.length === 0) {
    return {
      _nodeId: generateLocationToken(),
    };
  }
  const [first, ...rest] = positions;
  if (!rest.length) return { loc: first.loc, _nodeId: generateLocationToken() };
  const last = rest[rest.length - 1];
  return {
    loc: {
      pos: first.loc?.pos,
      end: last.loc?.end,
    },
    _nodeId: generateLocationToken(),
  } as Position;
}
