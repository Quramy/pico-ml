import { ExpressionNode } from "../parser";
import { EvaluationResult, EvaluationValue, Environment } from "./types";
import { createChildEnvironment, createRootEnvironment } from "./environment";
import { getEvaluationResultTypeName, isClosure, isRecClosure } from "./utils";
import { createClosure, createRecClosure } from "./closure";

function ok(value: EvaluationValue): EvaluationResult {
  return {
    ok: true,
    value,
  };
}

function error(message: string): EvaluationResult {
  return {
    ok: false,
    value: {
      message,
    },
  };
}

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

function mapEvalVal(env: Environment) {
  return (...nodes: ExpressionNode[]) => (cb: (...values: EvaluationValue[]) => EvaluationResult) => {
    const values: EvaluationValue[] = [];
    for (const node of nodes) {
      const result = evaluateWithEnv(node, env);
      if (!result.ok) return result;
      values.push(result.value);
    }
    return cb(...values);
  };
}

function evaluateWithEnv(expression: ExpressionNode, env: Environment): EvaluationResult {
  if (expression.kind === "BoolLiteral") {
    return ok(expression.value);
  } else if (expression.kind === "NumberLiteral") {
    return ok(expression.value);
  } else if (expression.kind === "Identifier") {
    const value = env.get(expression);
    if (value == null) {
      return error(`variable ${expression.name} is not defined`);
    }
    return ok(value);
  } else if (expression.kind === "FunctionDefinition") {
    return ok(createClosure(expression, env));
  } else if (expression.kind === "BinaryExpression") {
    return mapEvalVal(env)(expression.left, expression.right)((left, right) => {
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
          return undefined as never;
      }
    });
  } else if (expression.kind === "IfExpression") {
    return mapEvalVal(env)(expression.cond)(condition => {
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
  } else if (expression.kind === "LetRecExpression") {
    const { identifier, binding, exp } = expression;
    const boundValue = createRecClosure(binding, env, identifier);
    const childEnv = createChildEnvironment(identifier, boundValue, env);
    return evaluateWithEnv(exp, childEnv);
  } else if (expression.kind === "LetExpression") {
    return mapEvalVal(env)(expression.binding)(boundValue => {
      const childEnv = createChildEnvironment(expression.identifier, boundValue, env);
      return evaluateWithEnv(expression.exp, childEnv);
    });
  } else if (expression.kind === "FunctionApplication") {
    return mapEvalVal(env)(expression.callee, expression.argument)((callee, argument) => {
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
  return error(`invalid node kind`);
}

export function evaluate(expression: ExpressionNode) {
  return evaluateWithEnv(expression, createRootEnvironment());
}
