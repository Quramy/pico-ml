import { ok } from "../../structure";
import { EvaluateNodeFn } from "../types";

export const literal: EvaluateNodeFn<"BoolLiteral" | "IntLiteral"> = ({ value }) => ok(value);
