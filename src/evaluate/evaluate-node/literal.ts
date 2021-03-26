import { ok } from "../../structure";
import { EvaluateNodeFn } from "../types";

export const literal: EvaluateNodeFn<"BoolLiteral" | "NumberLiteral"> = ({ value }) => ok(value);
