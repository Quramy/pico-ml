import { ExpressionNode } from "./ast";

type EvaluetionResult = number | boolean | { falure: true };

function tryNumber(
  left: EvaluetionResult,
  right: EvaluetionResult,
  cb: (a: number, b: number) => EvaluetionResult
): EvaluetionResult {
  if (typeof left === "number" && typeof right === "number") {
    return cb(left, right);
  } else {
    return {
      falure: true
    };
  }
}

export function evaluate(expression: ExpressionNode): EvaluetionResult {
  if (expression.kind === "BoolLiteral") {
    return expression.value;
  } else if (expression.kind === "NumberLiteral") {
    return expression.value;
  } else if (expression.kind === "BinaryExpression") {
    const resultLeft = evaluate(expression.left);
    const resultRight = evaluate(expression.right);
    if (expression.op === "Add") {
      return tryNumber(resultLeft, resultRight, (l, r) => l + r);
    } else if (expression.op === "Multiply") {
      return tryNumber(resultLeft, resultRight, (l, r) => l * r);
    } else if (expression.op === "Sub") {
      return tryNumber(resultLeft, resultRight, (l, r) => l - r);
    } else if (expression.op === "LessThan") {
      return tryNumber(resultLeft, resultRight, (l, r) => l < r);
    }
  } else if (expression.kind === "IfExpression") {
    const condition = evaluate(expression.cond);
    if (typeof condition === "boolean") {
      if (condition) {
        return evaluate(expression.then);
      } else {
        return evaluate(expression.else);
      }
    } else {
      return { falure: true };
    }
  }
  throw new Error("invalid node");
}
