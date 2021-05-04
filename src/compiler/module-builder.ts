import { Result, ok, mapValue } from "../structure";
import { ModuleNode, parse, ModuleBodyNode } from "../wasm";

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
    const importedModules = new Set<string>();
    const createLinkFn = (def: ModuleDefinition): LinkFn => {
      return (dependent, self) => {
        if (importedModules.has(def.name)) return dependent;
        importedModules.add(def.name);
        if (!def.link) return defaultLinkFn(dependent, self);
        return def.link(dependent, self);
      };
    };
    const buildInner = (definition: ModuleDefinition): Result<ModuleNode> =>
      parse(definition.code).mapValue(dependentModule =>
        (definition.dependencies ?? [])
          .map(dependencyDefinition =>
            buildInner(dependencyDefinition).map(mod => ({ mod, linkFn: createLinkFn(dependencyDefinition) })),
          )
          .reduce(
            (mod, dependencyModule) =>
              mapValue(mod, dependencyModule)((mod, dependency) => ok(dependency.linkFn(mod, dependency.mod))),
            ok(dependentModule),
          ),
      );
    return buildInner(this).map(mod => ({ ...mod, body: [...mod.body, ...this.additionalFields] }));
  }
}
