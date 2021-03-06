import { ResultErrorBase, Result } from "../structure";
import type { Scanner } from "./scanner";

export interface Position {
  readonly _nodeId?: string;
  readonly loc?: {
    readonly pos: number;
    readonly end: number;
  };
}

export interface NullPosition extends Position {
  readonly _brand: "NullPosition";
}

export interface ParseError extends ResultErrorBase {
  readonly confirmed: boolean;
  readonly occurence: Position;
}

export type ParseValue = Position;
export type ParseResult<T extends ParseValue = ParseValue> = Result<T, ParseError>;

export interface Parser<T extends ParseValue = ParseValue> {
  (scanner: Scanner): ParseResult<T>;
}
