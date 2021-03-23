import { useResult } from "../structure";
import { ExpressionNode } from "../parser";
import { EvaluationResult, EvaluationValue, Environment } from "./types";
import { createChildEnvironment, createRootEnvironment } from "./environment";
import { getEvaluationResultTypeName, isClosure, isRecClosure, isList } from "./utils";
import { createClosure, createRecClosure } from "./closure";

const { ok, mapValues, error: err } = useResult<EvaluationResult>();

const error = (message: string) => err({ message });

function mapNumber(
  left: EvaluationValue,
  right: EvaluationValue,
  cb: (a: number, b: number) => EvaluationValue,
): EvaluationResult {
  if (typeof left !== "number") {
    return error(`The left operand is not number. ${getEvaluationResultTypeName(left)}`);
  }
  if (typeof right !== "number") {
    return error(`The right operand is not number. ${getEvaluationResultTypeName(right)}`);
  }
  return ok(cb(left, right));
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
  } else if (expression.kind === "BinaryExpression") {
    return mapValues(
      evaluateWithEnv(expression.left, env),
      evaluateWithEnv(expression.right, env),
    )((left, right) => {
      switch (expression.op.kind) {
        case "Add":
          return mapNumber(left, right, (l, r) => l + r);
        case "Sub":
          return mapNumber(left, right, (l, r) => l - r);
        case "Multiply":
          return mapNumber(left, right, (l, r) => l * r);
        case "LessThan":
          return mapNumber(left, right, (l, r) => l < r);
        default:
          // @ts-expect-error
          throw new Error(`invalid operation: ${expression.op.kind}`);
      }
    });
  } else if (expression.kind === "ListConstructor") {
    return mapValues(
      evaluateWithEnv(expression.head, env),
      evaluateWithEnv(expression.tail, env),
    )((head, tail) => {
      if (!isList(tail)) {
        return error(`The operand is not a list. ${getEvaluationResultTypeName(tail)}`);
      }
      return ok(isList(head) ? [...head, ...tail] : [head, ...tail]);
    });
  } else if (expression.kind === "IfExpression") {
    return mapValues(evaluateWithEnv(expression.cond, env))(condition => {
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
    return mapValues(evaluateWithEnv(expression.exp, env))(listValue => {
      if (!isList(listValue)) {
        return error(`exp should be a list, but: ${getEvaluationResultTypeName(listValue)}`);
      }
      if (listValue.length === 0) {
        return evaluateWithEnv(expression.emptyClause, env);
      } else {
        const [head, ...rest] = listValue;
        const childEnv = createChildEnvironment(
          expression.rightIdentifier,
          rest,
          createChildEnvironment(expression.leftIdentifier, head, env),
        );
        return evaluateWithEnv(expression.consClause, childEnv);
      }
    });
  } else if (expression.kind === "LetRecExpression") {
    const { identifier, binding, exp } = expression;
    const boundValue = createRecClosure(binding, env, identifier);
    const childEnv = createChildEnvironment(identifier, boundValue, env);
    return evaluateWithEnv(exp, childEnv);
  } else if (expression.kind === "LetExpression") {
    return mapValues(evaluateWithEnv(expression.binding, env))(boundValue => {
      const childEnv = createChildEnvironment(expression.identifier, boundValue, env);
      return evaluateWithEnv(expression.exp, childEnv);
    });
  } else if (expression.kind === "FunctionApplication") {
    return mapValues(
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
