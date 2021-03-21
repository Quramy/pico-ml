import { substituteType } from "./substitute";
import { int, substitution, bool, param, func, list } from "./testing/helpers";

describe(substituteType, () => {
  test(substituteType.name, () => {
    expect(substituteType(int(), substitution(param(0), bool()))).toEqual(int());
    expect(substituteType(func(param(0), param(1)), substitution(param(0), bool()))).toEqual(func(bool(), param(1)));
    expect(substituteType(list(list(param(0))), substitution(param(0), bool()))).toEqual(list(list(bool())));
    expect(substituteType(list(list(param(1))), substitution(param(0), bool()))).toEqual(list(list(param(1))));
  });
});
