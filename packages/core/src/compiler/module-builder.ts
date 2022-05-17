import { Result, ok, mapValue } from "../structure";
import { factory, ModuleNode, parse, ModuleBodyNode } from "../wasm";

type LinkFn = (dependent: ModuleNode, self: ModuleNode) => ModuleNode;

const defaultLinkFn: LinkFn = (dependent, self) => {
  const ret: ModuleNode = {
    ...self,
    body: [...self.body, ...dependent.body],
  };
  return ret;
};

export interface ModuleDefinition {
  readonly name: string;
  readonly code: string;
  readonly dependencies?: readonly ModuleDefinition[];
  readonly link?: LinkFn;
}

export class ModuleBuilder implements ModuleDefinition {
  private _name: string;
  private _code: string;
  private _dependencies: ModuleDefinition[];
  private _link?: LinkFn;
  private additionalFields: ModuleBodyNode[] = [];

  constructor(definition: ModuleDefinition) {
    this._name = definition.name;
    this._code = definition.code;
    this._dependencies = (definition.dependencies ?? []).slice();
    this._link = definition.link;
  }

  get name() {
    return this._name;
  }

  get code() {
    return this._code;
  }

  get dependencies() {
    return this._dependencies;
  }

  addDependency(def: ModuleDefinition) {
    this._dependencies.push(def);
    return this;
  }

  addDependencies(deps: readonly ModuleDefinition[]) {
    deps.forEach(def => this.addDependency(def));
    return this;
  }

  get link() {
    return this._link;
  }

  addField(field: ModuleBodyNode) {
    this.additionalFields.push(field);
    return this;
  }

  addFields(fields: readonly ModuleBodyNode[]) {
    fields.forEach(field => this.addField(field));
    return this;
  }

  build(): Result<ModuleNode> {
    const definitions: ModuleDefinition[] = [];
    const collectDependencies = (def: ModuleDefinition) => {
      definitions.push(def);
      if (!def.dependencies) return;
      def.dependencies.forEach(collectDependencies);
    };
    collectDependencies(this);
    const uniqueDefs: ModuleDefinition[] = [];
    while (true) {
      const d = definitions.pop();
      if (!d) break;
      if (uniqueDefs.find(dd => dd.name === d.name)) continue;
      uniqueDefs.push(d);
    }
    return uniqueDefs
      .reverse()
      .slice()
      .reduce(
        (acc, def) =>
          mapValue(acc, parse(def.code))((dependent, self) => ok((def.link ?? defaultLinkFn)(dependent, self))),
        ok(factory.mod([])),
      )
      .map(mod => ({ ...mod, body: [...mod.body, ...this.additionalFields] }));
  }
}
