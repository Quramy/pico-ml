import { MatchPatternNode, IdentifierNode } from "../parser";
import { EvaluationValue, Environment } from "./types";
import { isList } from "./utils";
import { createChildEnvironment } from "./environment";

interface Substitution {
  readonly lhs: IdentifierNode;
  readonly rhs: EvaluationValue;
}

function isMatchInner(
  value: EvaluationValue,
  pattern: MatchPatternNode,
  substitutions: readonly Substitution[],
): readonly Substitution[] | null {
  if (pattern.kind === "WildcardPattern") {
    return substitutions;
  } else if (pattern.kind === "EmptyListPattern") {
    return isList(value) && value.length === 0 ? substitutions : null;
  } else if (pattern.kind === "IdPattern") {
    return [...substitutions, { lhs: pattern.identifier, rhs: value }];
  } else if (pattern.kind === "ListConsPattern") {
    if (!isList(value)) return null;
    if (value.length === 0) return null;
    const [head, ...tail] = value;
    const resultHead = isMatchInner(head, pattern.head, substitutions);
    const resultTail = isMatchInner(tail, pattern.tail, substitutions);
    if (!resultHead || !resultTail) return null;
    return [...substitutions, ...resultHead, ...resultTail];
  }
  // @ts-expect-error
  throw new Error(`invalid kind: ${pattern.kind}`);
}

export function isMatch(value: EvaluationValue, pattern: MatchPatternNode, env: Environment): Environment | null {
  const substitutions = isMatchInner(value, pattern, []);
  if (!substitutions) return null;
  return substitutions.reduce((env, { lhs, rhs }) => createChildEnvironment(lhs, rhs, env), env);
}
