import { mapValue } from "../../structure";
import { PrimaryTypeNode, TypeEquation } from "../types";
import { result } from "./_result";
import { getTypeEnvForPattern, getPatternMatchClauseList } from "../utils";
import { unify } from "../unify";
import { toEquationSet, substituteType } from "../substitute";

export const matchExpression: PrimaryTypeNode<"MatchExpression"> = (expression, ctx, next) =>
  next(expression.exp, ctx).mapValue(exp => {
    const patterns = getPatternMatchClauseList(expression);
    return mapValue(
      ...patterns.map(({ pattern, exp: patternExpression }) =>
        getTypeEnvForPattern(pattern, exp.expressionType, ctx.env, ctx.generator).mapValue(({ typeEnv, equations }) =>
          next(patternExpression, { ...ctx, env: typeEnv }).map(patternType => ({
            patternType,
            equations,
          })),
        ),
      ),
    )((...patternTypeWrappers) => {
      const patternTypes = patternTypeWrappers.map(w => w.patternType);
      const equationSet = patternTypeWrappers.flatMap(w => w.equations);
      if (patternTypes.length === 0) throw new Error("unreachable");
      const [firstClause, ...restClauses] = patternTypes;
      const equationsForEachPatternExpression: TypeEquation[] = restClauses.map(clause => ({
        lhs: firstClause.expressionType,
        rhs: clause.expressionType,
      }));
      return unify([
        ...toEquationSet(exp, ...patternTypes),
        ...equationSet,
        ...equationsForEachPatternExpression,
      ]).mapValue(unified => result.ok(substituteType(firstClause.expressionType, ...unified), unified));
    });
  });
