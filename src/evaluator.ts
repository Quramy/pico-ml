import { ExpressionNode, IdentifierNode, FunctionDefinitionNode } from "./ast";

type RHS = number | boolean | Closure;

type EvaluationFailure = { failure: true; message: string };
type EvaluationResult = RHS | EvaluationFailure;

export function isFailed(
  result: EvaluationResult
): result is EvaluationFailure {
  if (result instanceof Closure) return false;
  return typeof result === "object" && result.failure === true;
}

function getType(value: EvaluationResult) {
  if (isFailed(value)) {
    return "failure";
  } else if (value instanceof RecClosure) {
    return "recursive function";
  } else if (value instanceof Closure) {
    return "function";
  } else if (typeof value === "number") {
    return "number";
  } else if (typeof value === "boolean") {
    return "boolean";
  }
}

interface Environment {
  get(identifier: IdentifierNode): RHS | undefined;
}

class RootEnvironment implements Environment {
  get(_identifier: IdentifierNode) {
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

class RecClosure extends Closure {
  constructor(
    public readonly recursievId: IdentifierNode,
    public readonly functionDefinition: FunctionDefinitionNode,
    public readonly env: Environment
  ) {
    super(functionDefinition, env);
  }
}

function tryNumber(
  left: EvaluationResult,
  right: EvaluationResult,
  cb: (a: number, b: number) => EvaluationResult
): EvaluationResult {
  if (isFailed(left)) return left;
  if (isFailed(right)) return right;
  if (typeof left !== "number") {
    return {
      failure: true,
      message: `The left operand is not number. ${getType(left)}`,
    };
  }
  if (typeof right !== "number") {
    return {
      failure: true,
      message: `The right operand is not number. ${getType(right)}`,
    };
  }
  return cb(left, right);
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
    if (!v)
      return {
        failure: true,
        message: `variable ${expression.name} is not defined`,
      };
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
    if (isFailed(condition)) return condition;
    if (typeof condition === "boolean") {
      if (condition) {
        return evaluateWithEnv(expression.then, env);
      } else {
        return evaluateWithEnv(expression.else, env);
      }
    } else {
      return {
        failure: true,
        message: `condition should be boolean, but: ${getType(condition)}.`,
      };
    }
  } else if (expression.kind === "LetRecExpression") {
    const { identifier, binding, exp } = expression;
    const boundValue = new RecClosure(identifier, binding, env);
    const childEnv = new ChildEnvironment(identifier, boundValue, env);
    return evaluateWithEnv(exp, childEnv);
  } else if (expression.kind === "LetExpression") {
    const { identifier, binding, exp } = expression;
    const boundValue = evaluateWithEnv(binding, env);
    if (isFailed(boundValue)) return boundValue;
    const childEnv = new ChildEnvironment(identifier, boundValue, env);
    return evaluateWithEnv(exp, childEnv);
  } else if (expression.kind === "FunctionApplication") {
    const callee = evaluateWithEnv(expression.callee, env);
    if (!(callee instanceof Closure)) {
      return {
        failure: true,
        message: `should be function, but ${getType(callee)}}`,
      };
    }
    if (callee instanceof RecClosure) {
      const argument = evaluateWithEnv(expression.argument, env);
      if (isFailed(argument)) {
        return argument;
      }
      const recEnv = new ChildEnvironment(
        callee.recursievId,
        callee,
        callee.env
      );
      return evaluateWithEnv(
        callee.functionDefinition.body,
        new ChildEnvironment(callee.functionDefinition.param, argument, recEnv)
      );
    } else {
      const argument = evaluateWithEnv(expression.argument, env);
      if (isFailed(argument)) {
        return argument;
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
  }
  throw new Error("invalid node");
}

export function evaluate(expression: ExpressionNode) {
  return evaluateWithEnv(expression, new RootEnvironment());
}
