import { mapValue, useResult } from "../structure";
import { ExpressionNode } from "../parser";
import { EvaluationResult, EvaluationValue, Environment } from "./types";
import { createChildEnvironment, createRootEnvironment } from "./environment";
import { getEvaluationResultTypeName, isClosure, isRecClosure, isList } from "./utils";
import { createClosure, createRecClosure } from "./closure";
import { isMatch } from "./pattern-match";
import { MatchClauseNode } from "../parser/types";

const { ok, error: err } = useResult<EvaluationResult>();

const error = (message: string) => err({ message });

function map2num(...operands: EvaluationValue[]) {
  return (cb: (...numberOperands: number[]) => EvaluationValue) => {
    for (const operand of operands) {
      if (typeof operand !== "number") {
        return error(`The operand is not number. ${getEvaluationResultTypeName(operand)}`);
      }
    }
    return ok(cb(...(operands as number[])));
  };
}

function evaluateWithEnv(expression: ExpressionNode, env: Environment): EvaluationResult {
  if (expression.kind === "BoolLiteral") {
    return ok(expression.value);
  } else if (expression.kind === "NumberLiteral") {
    return ok(expression.value);
  } else if (expression.kind === "EmptyList") {
    return ok([]);
  } else if (expression.kind === "Identifier") {
    const value = env.get(expression);
    if (value == null) {
      return error(`variable ${expression.name} is not defined`);
    }
    return ok(value);
  } else if (expression.kind === "FunctionDefinition") {
    return ok(createClosure(expression, env));
  } else if (expression.kind === "UnaryExpression") {
    return mapValue(evaluateWithEnv(expression.exp, env))(exp => {
      switch (expression.op.kind) {
        case "Minus":
          return map2num(exp)(v => -1 * v);
        default:
          throw new Error(`invalid operation: ${expression.op.kind}`);
      }
    });
  } else if (expression.kind === "BinaryExpression") {
    return mapValue(
      evaluateWithEnv(expression.left, env),
      evaluateWithEnv(expression.right, env),
    )((left, right) => {
      switch (expression.op.kind) {
        case "Add":
          return map2num(left, right)((l, r) => l + r);
        case "Sub":
          return map2num(left, right)((l, r) => l - r);
        case "Multiply":
          return map2num(left, right)((l, r) => l * r);
        case "LessThan":
          return map2num(left, right)((l, r) => l < r);
        default:
          // @ts-expect-error
          throw new Error(`invalid operation: ${expression.op.kind}`);
      }
    });
  } else if (expression.kind === "ListConstructor") {
    return mapValue(
      evaluateWithEnv(expression.head, env),
      evaluateWithEnv(expression.tail, env),
    )((head, tail) => {
      if (!isList(tail)) {
        return error(`The operand is not a list. ${getEvaluationResultTypeName(tail)}`);
      }
      return ok(isList(head) ? [...head, ...tail] : [head, ...tail]);
    });
  } else if (expression.kind === "IfExpression") {
    return mapValue(evaluateWithEnv(expression.cond, env))(condition => {
      if (typeof condition === "boolean") {
        if (condition) {
          return evaluateWithEnv(expression.then, env);
        } else {
          return evaluateWithEnv(expression.else, env);
        }
      } else {
        return error(`condition should be boolean, but: ${getEvaluationResultTypeName(condition)}.`);
      }
    });
  } else if (expression.kind === "MatchExpression") {
    return mapValue(evaluateWithEnv(expression.exp, env))(value => {
      const tryNextPattern = (matchClause: MatchClauseNode): EvaluationResult => {
        if (matchClause.kind === "PatternMatchClause") {
          const matchedEnv = isMatch(value, matchClause.pattern, env);
          if (!matchedEnv) return error("Match failure");
          return evaluateWithEnv(matchClause.exp, matchedEnv);
        } else {
          const matchedEnv = isMatch(value, matchClause.patternMatch.pattern, env);
          if (!matchedEnv) {
            return tryNextPattern(matchClause.or);
          }
          return evaluateWithEnv(matchClause.patternMatch.exp, matchedEnv);
        }
      };
      return tryNextPattern(expression.matchClause);
    });
  } else if (expression.kind === "LetRecExpression") {
    const { identifier, binding, exp } = expression;
    const boundValue = createRecClosure(binding, env, identifier);
    const childEnv = createChildEnvironment(identifier, boundValue, env);
    return evaluateWithEnv(exp, childEnv);
  } else if (expression.kind === "LetExpression") {
    return mapValue(evaluateWithEnv(expression.binding, env))(boundValue => {
      const childEnv = createChildEnvironment(expression.identifier, boundValue, env);
      return evaluateWithEnv(expression.exp, childEnv);
    });
  } else if (expression.kind === "FunctionApplication") {
    return mapValue(
      evaluateWithEnv(expression.callee, env),
      evaluateWithEnv(expression.argument, env),
    )((callee, argument) => {
      if (!isClosure(callee)) {
        return error(`should be function, but ${getEvaluationResultTypeName(callee)}}`);
      }
      if (!isRecClosure(callee)) {
        return evaluateWithEnv(
          callee.functionDefinition.body,
          createChildEnvironment(callee.functionDefinition.param, argument, callee.env),
        );
      } else {
        const recEnv = createChildEnvironment(callee.recursievId, callee, callee.env);
        return evaluateWithEnv(
          callee.functionDefinition.body,
          createChildEnvironment(callee.functionDefinition.param, argument, recEnv),
        );
      }
    });
  }

  // @ts-expect-error
  return error(`invalid node kind ${expression.kind}`);
}

export function evaluate(expression: ExpressionNode) {
  return evaluateWithEnv(expression, createRootEnvironment());
}
