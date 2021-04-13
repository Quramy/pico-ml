import { error } from "../../structure";
import { MatchClauseNode } from "../../syntax";
import { EvaluateNodeFn, EvaluationResult } from "../types";
import { isMatch } from "./pattern-match";

export const matchExpression: EvaluateNodeFn<"MatchExpression"> = (expression, env, next) =>
  next(expression.exp, env).mapValue(value => {
    const tryNextPattern = (matchClause: MatchClauseNode): EvaluationResult => {
      if (matchClause.kind === "PatternMatchClause") {
        const matchedEnv = isMatch(value, matchClause.pattern, env);
        if (!matchedEnv) return error({ message: "Match failure", occurence: expression.matchClause });
        return next(matchClause.exp, matchedEnv);
      } else {
        const matchedEnv = isMatch(value, matchClause.patternMatch.pattern, env);
        if (!matchedEnv) {
          return tryNextPattern(matchClause.or);
        }
        return next(matchClause.patternMatch.exp, matchedEnv);
      }
    };
    return tryNextPattern(expression.matchClause);
  });
