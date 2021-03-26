import { useResult } from "../../structure";
import { PrimaryTypeResult, TypeValue, TypeSubstitution } from "../types";

const { ok: _ok, error } = useResult<PrimaryTypeResult>();

const ok = (type: TypeValue, substitutions: readonly TypeSubstitution[] = [] as const) =>
  _ok({
    expressionType: type,
    substitutions,
  });

export const result = {
  ok,
  error,
};
