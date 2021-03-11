import { ExpressionNode, IdentifierNode, FunctionDefinitionNode } from "./ast";

type RHS = number | boolean | Closure;

type EvaluationFailure = { failure: true };
type EvaluationResult = RHS | EvaluationFailure;

function isFailed(result: EvaluationResult): result is EvaluationFailure {
  if (result instanceof Closure) return false;
  return typeof result === "object" && result.failure === true;
}

function tryNumber(
  left: EvaluationResult,
  right: EvaluationResult,
  cb: (a: number, b: number) => EvaluationResult
): EvaluationResult {
  if (typeof left === "number" && typeof right === "number") {
    return cb(left, right);
  } else {
    return {
      failure: true
    };
  }
}

interface Environment {
  get(identifier: IdentifierNode): RHS | undefined;
}

class RootEnvironment implements Environment {
  get(identifier: IdentifierNode) {
    return undefined;
  }
}

class ChildEnvironment implements Environment {
  constructor(
    private readonly identifier: IdentifierNode,
    private readonly value: RHS,
    private readonly parent: Environment
  ) {}
  get(identifier: IdentifierNode) {
    if (this.identifier?.name === identifier.name) {
      return this.value;
    }
    return this.parent.get(identifier);
  }
}

class Closure {
  constructor(
    public readonly functionDefinition: FunctionDefinitionNode,
    public readonly env: Environment
  ) {}
}

function evaluateWithEnv(
  expression: ExpressionNode,
  env: Environment
): EvaluationResult {
  if (expression.kind === "BoolLiteral") {
    return expression.value;
  } else if (expression.kind === "NumberLiteral") {
    return expression.value;
  } else if (expression.kind === "Identifier") {
    const v = env.get(expression);
    if (!v) return { failure: true };
    return v;
  } else if (expression.kind === "FunctionDefinition") {
    return new Closure(expression, env);
  } else if (expression.kind === "BinaryExpression") {
    const resultLeft = evaluateWithEnv(expression.left, env);
    const resultRight = evaluateWithEnv(expression.right, env);
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
    const condition = evaluateWithEnv(expression.cond, env);
    if (typeof condition === "boolean") {
      if (condition) {
        return evaluateWithEnv(expression.then, env);
      } else {
        return evaluateWithEnv(expression.else, env);
      }
    } else {
      return { failure: true };
    }
  } else if (expression.kind === "LetExpression") {
    const { identifier, binding, exp } = expression;
    const boundValue = evaluateWithEnv(binding, env);
    if (isFailed(boundValue)) return { failure: true };
    const childEnv = new ChildEnvironment(identifier, boundValue, env);
    return evaluateWithEnv(exp, childEnv);
  } else if (expression.kind === "FunctionApplication") {
    const callee = evaluateWithEnv(expression.callee, env);
    if (!(callee instanceof Closure)) {
      return { failure: true };
    }
    const argument = evaluateWithEnv(expression.argument, env);
    if (isFailed(argument)) {
      return { failure: true };
    }
    return evaluateWithEnv(
      callee.functionDefinition.body,
      new ChildEnvironment(
        callee.functionDefinition.param,
        argument,
        callee.env
      )
    );
  }
  throw new Error("invalid node");
}

export function evaluate(expression: ExpressionNode) {
  return evaluateWithEnv(expression, new RootEnvironment());
}
