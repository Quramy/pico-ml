export function toNumber(_instance: WebAssembly.Instance, value: number) {
  return value;
}

export function toBoolean(_instance: WebAssembly.Instance, value: number) {
  return value ? true : false;
}

export function toList(instance: WebAssembly.Instance, value: number) {
  const getTail = instance.exports["__list_tail__"] as (addr: number) => number;
  const getHeadValue = instance.exports["__list_head__"] as (addr: number) => number;
  const inner = (addr: number): readonly number[] => {
    if (addr > 0) {
      return [getHeadValue(addr), ...inner(getTail(addr))];
    } else {
      return [];
    }
  };
  return inner(value);
}
