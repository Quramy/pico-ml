import { ExpressionNode, IdentifierNode, FunctionDefinitionNode } from "./ast";

interface EvaluationFailure {
  readonly kind: "Failure";
  readonly failure: true;
  readonly message: string;
}

interface Environment {
  get(identifier: IdentifierNode): RHS | undefined;
}

interface Closure {
  readonly kind: "Closure";
  readonly functionDefinition: FunctionDefinitionNode;
  readonly env: Environment;
  readonly closureModifier?: string;
}

interface RecClosure extends Closure {
  readonly closureModifier: "Recursive";
  readonly recursievId: IdentifierNode;
}

type RHS = number | boolean | Closure;

type EvaluationResult = RHS | EvaluationFailure;

function createFailure(message: string) {
  return {
    kind: "Failure",
    failure: true,
    message,
  } as EvaluationFailure;
}

function createRootEnvironment(): Environment {
  return {
    get() {
      return undefined;
    },
  };
}

function createChildEnvironment(id: IdentifierNode, value: RHS, parent: Environment): Environment {
  return {
    get(identifier: IdentifierNode) {
      if (id.name === identifier.name) {
        return value;
      }
      return parent.get(identifier);
    },
  };
}

function createClosure(functionDefinition: FunctionDefinitionNode, env: Environment) {
  return {
    kind: "Closure",
    env,
    functionDefinition,
  } as Closure;
}

function createRecClosure(functionDefinition: FunctionDefinitionNode, env: Environment, recursievId: IdentifierNode) {
  return {
    ...createClosure(functionDefinition, env),
    closureModifier: "Recursive",
    recursievId,
  } as RecClosure;
}

export function isFailed(result: EvaluationResult): result is EvaluationFailure {
  return typeof result === "object" && result.kind === "Failure";
}

export function isClosure(value: EvaluationResult): value is Closure {
  return typeof value === "object" && value.kind === "Closure";
}

export function isRecClosure(value: EvaluationResult): value is RecClosure {
  return typeof value === "object" && value.kind === "Closure" && value.closureModifier === "Recursive";
}

function getType(value: EvaluationResult) {
  if (isFailed(value)) {
    return "failure";
  } else if (isRecClosure(value)) {
    return "recursive function";
  } else if (isClosure(value)) {
    return "function";
  } else if (typeof value === "number") {
    return "number";
  } else if (typeof value === "boolean") {
    return "boolean";
  }
}

function tryNumber(
  left: EvaluationResult,
  right: EvaluationResult,
  cb: (a: number, b: number) => EvaluationResult,
): EvaluationResult {
  if (isFailed(left)) return left;
  if (isFailed(right)) return right;
  if (typeof left !== "number") {
    return createFailure(`The left operand is not number. ${getType(left)}`);
  }
  if (typeof right !== "number") {
    return createFailure(`The right operand is not number. ${getType(right)}`);
  }
  return cb(left, right);
}

function evaluateWithEnv(expression: ExpressionNode, env: Environment): EvaluationResult {
  if (expression.kind === "BoolLiteral") {
    return expression.value;
  } else if (expression.kind === "NumberLiteral") {
    return expression.value;
  } else if (expression.kind === "Identifier") {
    const v = env.get(expression);
    if (!v) return createFailure(`variable ${expression.name} is not defined`);
    return v;
  } else if (expression.kind === "FunctionDefinition") {
    return createClosure(expression, env);
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
      return createFailure(`condition should be boolean, but: ${getType(condition)}.`);
    }
  } else if (expression.kind === "LetRecExpression") {
    const { identifier, binding, exp } = expression;
    const boundValue = createRecClosure(binding, env, identifier);
    const childEnv = createChildEnvironment(identifier, boundValue, env);
    return evaluateWithEnv(exp, childEnv);
  } else if (expression.kind === "LetExpression") {
    const { identifier, binding, exp } = expression;
    const boundValue = evaluateWithEnv(binding, env);
    if (isFailed(boundValue)) return boundValue;
    const childEnv = createChildEnvironment(identifier, boundValue, env);
    return evaluateWithEnv(exp, childEnv);
  } else if (expression.kind === "FunctionApplication") {
    const callee = evaluateWithEnv(expression.callee, env);
    if (!isClosure(callee)) {
      return createFailure(`should be function, but ${getType(callee)}}`);
    }
    const argument = evaluateWithEnv(expression.argument, env);
    if (isFailed(argument)) {
      return argument;
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
  }
  throw new Error("invalid node");
}

export function evaluate(expression: ExpressionNode) {
  return evaluateWithEnv(expression, createRootEnvironment());
}
