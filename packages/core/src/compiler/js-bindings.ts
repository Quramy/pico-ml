export function fromNumber2IntBase(value: number) {
  return (value << 1) | 1;
}

export interface ValueExtractor<T> {
  (instance: WebAssembly.Instance, value: number): T;
}

export function toNumber(_instance: WebAssembly.Instance, value: number) {
  return value >> 1;
}

export function toFloat(instance: WebAssembly.Instance, value: number) {
  const getFloat = instance.exports["__float_get__"] as (addr: number) => number;
  return getFloat(value);
}

export function toBoolean(_instance: WebAssembly.Instance, value: number) {
  return value ? true : false;
}

export function toListAnd<T>(conv: ValueExtractor<T>) {
  return (instance: WebAssembly.Instance, value: number) => {
    const getTail = instance.exports["__list_tail__"] as (addr: number) => number;
    const getHeadValue = instance.exports["__list_head__"] as (addr: number) => number;
    const inner = (addr: number): readonly number[] => {
      if (addr > 0) {
        return [getHeadValue(addr), ...inner(getTail(addr))];
      } else {
        return [];
      }
    };
    return inner(value).map(x => conv(instance, x));
  };
}

export function toList(instance: WebAssembly.Instance, value: number) {
  return toListAnd((_, x) => x)(instance, value);
}
