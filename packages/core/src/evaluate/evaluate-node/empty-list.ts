import { ok } from "../../structure";
import { EvaluateNodeFn } from "../types";

export const emptyList: EvaluateNodeFn<"EmptyList"> = () => ok([]);
