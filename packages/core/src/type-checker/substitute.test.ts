import { substituteType, substituteScheme, substituteEnv } from "./substitute";
import { int, substitution, bool, param, func, list, scheme } from "./testing/helpers";
import { createRootEnvironment, createChildEnvironment } from "./type-environment";

describe("substitute", () => {
  test(substituteType.name, () => {
    expect(substituteType(int(), substitution(param(0), bool()))).toEqual(int());
    expect(substituteType(func(param(0), param(1)), substitution(param(0), bool()))).toEqual(func(bool(), param(1)));
    expect(substituteType(list(list(param(0))), substitution(param(0), bool()))).toEqual(list(list(bool())));
    expect(substituteType(list(list(param(1))), substitution(param(0), bool()))).toEqual(list(list(param(1))));
  });

  test(substituteScheme.name, () => {
    expect(substituteScheme(scheme(param(0), []), substitution(param(0), int()))).toEqual(scheme(int(), []));
    expect(substituteScheme(scheme(param(0), [param(0)]), substitution(param(0), int()))).toEqual(
      scheme(param(0), [param(0)]),
    );
  });

  test(substituteEnv.name, () => {
    const root = createRootEnvironment();
    const id = {
      kind: "Identifier",
      name: "x",
    } as const;
    const env = createChildEnvironment(id, scheme(func(param(0), param(1)), [param(0)]), root);
    const substituted = substituteEnv(env, substitution(param(1), int()));
    expect(substituted.get(id)!).toEqual(scheme(func(param(0), int()), [param(0)]));
  });
});
