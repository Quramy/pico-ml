export interface RefereneceContext {
  readonly types: Map<string, number>;
  readonly funcs: Map<string, number>;
  readonly tables: Map<string, number>;
  readonly mems: Map<string, number>;
  readonly globals: Map<string, number>;
  readonly elem: Map<string, number>;
  readonly locals?: Map<string, number>;
  readonly labels?: Map<string, number>;
}
