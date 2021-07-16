import { TypeParameterType, TypeValue, TypeScheme, TypeEnvironment, TypeSubstitution } from "./types";

type FTV = readonly TypeParameterType[];

function unique(ftv: FTV): FTV {
  const set = ftv.slice().sort((a, b) => a.id - b.id);
  return set.reduce((acc, t) => (acc[0]?.id === t.id ? acc : [t, ...acc]), [] as TypeParameterType[]).reverse();
}

function subtract(sortedA: FTV, sortedB: FTV): FTV {
  let i = 0,
    j = 0;
  let result: TypeParameterType[] = [];
  while (i < sortedA.length) {
    const va = sortedA[i];
    const vb = sortedB[j];
    if (!vb || va.id < vb.id) {
      result.push(va);
      i++;
    } else if (va.id === vb.id) {
      i++;
      j++;
    } else if (va.id > vb.id) {
      j++;
    }
  }
  return result;
}

function getTypeFTVLoop(type: TypeValue): FTV {
  switch (type.kind) {
    case "Int":
    case "Float":
    case "Bool":
      return [];
    case "TypeParameter":
      return [type];
    case "List":
      return getTypeFTVLoop(type.elementType);
    case "Function":
      return [...getTypeFTVLoop(type.paramType), ...getTypeFTVLoop(type.returnType)];
  }
}

function getTypeFTV(type: TypeValue): FTV {
  return unique(getTypeFTVLoop(type));
}

function getSchemeFTV(scheme: TypeScheme): FTV {
  const typeFTV = getTypeFTV(scheme.type);
  const variables = unique(scheme.variables);
  return subtract(typeFTV, variables);
}

function getEnvironmentFTVLoop(env: TypeEnvironment): FTV {
  const parent = env.parent();
  if (!parent) return [];
  return [...getEnvironmentFTVLoop(parent.env), ...getSchemeFTV(parent.value)];
}

function getEnvironmentFTV(env: TypeEnvironment): FTV {
  return unique(getEnvironmentFTVLoop(env));
}

export function getFreeTypeVariables(type: TypeValue | TypeScheme | TypeEnvironment): FTV {
  switch (type.kind) {
    case "TypeScheme":
      return getSchemeFTV(type);
    case "TypeEnvironment":
      return getEnvironmentFTV(type);
    default:
      return getTypeFTV(type);
  }
}

export function getResolvedTypeVariables(substitutions: readonly TypeSubstitution[]): FTV {
  return unique(substitutions.map(s => s.from));
}

export function getClosure(type: TypeValue, env: TypeEnvironment): TypeScheme {
  const variables = subtract(getTypeFTV(type), getEnvironmentFTV(env));
  return {
    kind: "TypeScheme",
    type,
    variables,
  };
}
